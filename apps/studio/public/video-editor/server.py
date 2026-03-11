#!/usr/bin/env python3
"""Editor server with render API endpoint."""
import http.server
import json
import mimetypes
import os
import subprocess
import sys
import re
import tempfile
import shutil
import threading
import urllib.parse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
try:
    from pilmoji import Pilmoji
    HAS_PILMOJI = True
except ImportError:
    HAS_PILMOJI = False

PORT = 8090
BASE = Path(__file__).parent.resolve()
W, H = 1080, 1920  # 9:16 vertical
FONT_PATH = os.path.expanduser("~/Library/Fonts/NotoSansKR-Bold.ttf")

# Track render status
render_status = {"state": "idle", "progress": 0, "total": 0, "error": None, "output": None}
render_lock = threading.Lock()

# Track analyze status
analyze_status = {"state": "idle", "progress": "", "error": None, "result": None}
analyze_lock = threading.Lock()

# Path to thread_video_cutter
CUTTER_SCRIPT = Path(os.path.expanduser("~/clawd/skills/thread-video-cutter/thread_video_cutter.py"))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def handle_one_request(self):
        """Override to catch BrokenPipe/ConnectionReset without crashing."""
        try:
            super().handle_one_request()
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass  # Client disconnected, ignore silently

    def log_message(self, format, *args):
        """Suppress noisy logs for status polling."""
        msg = format % args
        if "/api/render/status" in msg:
            return
        super().log_message(format, *args)

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_POST(self):
        if self.path == "/api/render":
            self.handle_render()
        elif self.path == "/api/analyze":
            self.handle_analyze()
        elif self.path == "/api/projects/save":
            self.handle_project_save()
        elif self.path == "/api/projects/delete":
            self.handle_project_delete()
        elif self.path == "/api/upload":
            self.handle_upload()
        elif self.path == "/api/upload-external":
            self.handle_upload_external()
        else:
            self.send_error(404)

    def do_GET(self):
        # Handle Range requests first (for video seeking)
        if not self.path.startswith("/api/") and self.headers.get('Range'):
            self.handle_range_request()
            return
        if self.path == "/api/render/status":
            self.send_json(render_status)
        elif self.path == "/api/analyze/status":
            self.send_json(analyze_status)
        elif self.path.startswith("/api/render/download"):
            self.handle_download()
        elif self.path == "/api/list-videos":
            self.handle_list_videos()
        elif self.path.startswith("/api/thumbnail/"):
            self.handle_thumbnail()
        elif self.path == "/api/projects":
            self.handle_project_list()
        elif self.path.startswith("/api/projects/load/"):
            self.handle_project_load()
        else:
            super().do_GET()

    def handle_range_request(self):
        """Handle HTTP Range requests for video seeking (206 Partial Content)."""
        path = self.translate_path(self.path.split('?')[0])
        if not os.path.isfile(path):
            self.send_error(404)
            return
        file_size = os.path.getsize(path)
        range_header = self.headers.get('Range')
        # Parse range: "bytes=START-END" or "bytes=START-"
        try:
            range_spec = range_header.replace('bytes=', '')
            parts = range_spec.split('-')
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if parts[1] else file_size - 1
        except (ValueError, IndexError):
            start = 0
            end = file_size - 1
        
        if start >= file_size:
            self.send_error(416, "Range Not Satisfiable")
            return
        
        end = min(end, file_size - 1)
        content_length = end - start + 1
        
        # Guess content type
        ctype = mimetypes.guess_type(path)[0] or 'application/octet-stream'
        
        self.send_response(206)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", content_length)
        self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        
        with open(path, 'rb') as f:
            f.seek(start)
            remaining = content_length
            buf_size = 64 * 1024
            while remaining > 0:
                chunk = f.read(min(buf_size, remaining))
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError):
                    break
                remaining -= len(chunk)

    def send_json(self, data):
        body = json.dumps(data).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)

    def handle_project_list(self):
        proj_dir = BASE / "_projects"
        proj_dir.mkdir(exist_ok=True)
        projects = []
        for f in sorted(proj_dir.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True):
            try:
                data = json.loads(f.read_text())
                projects.append({
                    "id": f.stem,
                    "name": data.get("name", f.stem),
                    "clipCount": len(data.get("clips", [])),
                    "totalDuration": round(data.get("totalDuration", 0), 1),
                    "updatedAt": f.stat().st_mtime,
                    "sources": data.get("sources", [])
                })
            except:
                pass
        self.send_json({"projects": projects})

    def handle_project_save(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}
        proj_dir = BASE / "_projects"
        proj_dir.mkdir(exist_ok=True)
        
        pid = body.get("id") or f"project_{int(threading.Event().wait(0) or __import__('time').time()*1000)}"
        body["id"] = pid
        
        fpath = proj_dir / f"{pid}.json"
        fpath.write_text(json.dumps(body, ensure_ascii=False, indent=2))
        self.send_json({"status": "saved", "id": pid})

    def handle_project_load(self):
        pid = self.path.split("/api/projects/load/")[1]
        pid = urllib.parse.unquote(pid)
        fpath = BASE / "_projects" / f"{pid}.json"
        if not fpath.exists():
            self.send_error(404, "Project not found")
            return
        data = json.loads(fpath.read_text())
        self.send_json(data)

    def handle_project_delete(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}
        pid = body.get("id")
        if not pid:
            self.send_json({"error": "No id"})
            return
        fpath = BASE / "_projects" / f"{pid}.json"
        if fpath.exists():
            fpath.unlink()
        self.send_json({"status": "deleted"})

    def handle_upload(self):
        """Handle multipart file upload."""
        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            self.send_json({"error": "multipart required"})
            return
        
        # Parse boundary
        boundary = None
        for part in content_type.split(";"):
            part = part.strip()
            if part.startswith("boundary="):
                boundary = part.split("=", 1)[1].strip('"')
        if not boundary:
            self.send_json({"error": "no boundary"})
            return
        
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        
        boundary_bytes = f"--{boundary}".encode()
        parts = body.split(boundary_bytes)
        
        uploaded = []
        for part in parts:
            if b"Content-Disposition" not in part:
                continue
            # Split headers and content
            header_end = part.find(b"\r\n\r\n")
            if header_end < 0:
                continue
            header_section = part[:header_end].decode("utf-8", errors="replace")
            file_data = part[header_end + 4:]
            # Remove trailing \r\n
            if file_data.endswith(b"\r\n"):
                file_data = file_data[:-2]
            
            # Extract filename
            filename = None
            for line in header_section.split("\r\n"):
                if "filename=" in line:
                    fn_start = line.find('filename="')
                    if fn_start >= 0:
                        fn_start += 10
                        fn_end = line.find('"', fn_start)
                        filename = line[fn_start:fn_end]
            
            if filename and file_data:
                safe_name = Path(filename).name
                dest = BASE / safe_name
                with open(dest, "wb") as f:
                    f.write(file_data)
                
                # Check if it's an image — convert to still video clip
                img_exts = {".jpg", ".jpeg", ".png", ".heic", ".webp", ".gif", ".bmp", ".tiff"}
                if Path(safe_name).suffix.lower() in img_exts:
                    still_name = Path(safe_name).stem + "_still.mp4"
                    still_path = BASE / still_name
                    dur_sec = 4  # default 4 seconds for images
                    subprocess.run([
                        "ffmpeg", "-y", "-loop", "1", "-i", str(dest), "-t", str(dur_sec),
                        "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black",
                        "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30",
                        str(still_path)
                    ], capture_output=True, timeout=30)
                    if still_path.exists():
                        safe_name = still_name
                        dur = dur_sec
                        size_mb = still_path.stat().st_size / 1024 / 1024
                    else:
                        dur = 0
                        size_mb = dest.stat().st_size / 1024 / 1024
                else:
                    dur = get_video_duration(str(dest))
                    size_mb = dest.stat().st_size / 1024 / 1024
                
                uploaded.append({"name": safe_name, "duration": round(dur, 1), "size": round(size_mb, 1)})
        
        self.send_json({"uploaded": uploaded})

    def handle_list_videos(self):
        """List video files in the base directory."""
        exts = {".mov", ".mp4", ".avi", ".mkv", ".webm", ".m4v"}
        videos = []
        skip = {"thread_output", "thread_with_subs", "vlog_dev", "edited_output"}
        for f in sorted(BASE.iterdir()):
            stem = f.stem.split("_v")[0] if "_v" in f.stem else f.stem
            if f.suffix.lower() in exts and not f.name.startswith("_") and not f.name.startswith("edited_") and stem not in skip and not any(f.stem.startswith(s) for s in skip):
                dur = get_video_duration(str(f))
                fps = get_video_fps(str(f))
                size_mb = f.stat().st_size / 1024 / 1024
                videos.append({
                    "name": f.name,
                    "duration": round(dur, 1),
                    "size": round(size_mb, 1),
                    "fps": fps
                })
        self.send_json({"videos": videos})

    def handle_thumbnail(self):
        """Generate and serve a thumbnail for a video file."""
        import urllib.parse
        name = urllib.parse.unquote(self.path.split("/api/thumbnail/", 1)[1])
        video_path = BASE / name
        if not video_path.exists():
            self.send_error(404, "Video not found")
            return
        
        # Cache thumbnails in _thumbs/
        thumb_dir = BASE / "_thumbs"
        thumb_dir.mkdir(exist_ok=True)
        thumb_path = thumb_dir / f"{video_path.stem}.jpg"
        
        if not thumb_path.exists():
            try:
                subprocess.run([
                    "ffmpeg", "-y", "-i", str(video_path),
                    "-ss", "0.5", "-vframes", "1",
                    "-vf", "scale=160:-2",
                    "-q:v", "8",
                    str(thumb_path)
                ], capture_output=True, timeout=10)
            except Exception:
                self.send_error(500, "Thumbnail generation failed")
                return
        
        if not thumb_path.exists():
            self.send_error(500, "Thumbnail not generated")
            return
        
        data = thumb_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "image/jpeg")
        self.send_header("Content-Length", len(data))
        self.send_header("Cache-Control", "public, max-age=86400")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(data)

    def handle_upload_external(self):
        """Symlink an external video file into the editor directory."""
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}
        src_path = Path(body.get("path", "")).expanduser()
        
        if not src_path.exists():
            self.send_json({"error": f"File not found: {src_path}"})
            return
        
        dest = BASE / src_path.name
        if not dest.exists():
            dest.symlink_to(src_path)
        
        dur = get_video_duration(str(dest))
        fps = get_video_fps(str(dest))
        size_mb = dest.stat().st_size / 1024 / 1024
        
        self.send_json({
            "name": dest.name,
            "duration": round(dur, 1),
            "size": round(size_mb, 1),
            "fps": fps
        })

    def handle_analyze(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}
        
        files = body.get("files", [])
        options = body.get("options", {})
        
        if not files:
            self.send_json({"error": "No files selected"})
            return
        
        with analyze_lock:
            analyze_status.update(state="analyzing", progress="준비 중...", error=None, result=None)
        
        self.send_json({"status": "started"})
        
        t = threading.Thread(target=run_analyze, args=(files, options), daemon=True)
        t.start()

    def handle_render(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}

        clips = body.get("clips", [])
        if not clips:
            self.send_json({"error": "No clips"})
            return

        with render_lock:
            render_status.update(state="rendering", progress=0, total=len(clips), error=None, output=None)

        self.send_json({"status": "started", "total": len(clips)})

        # Run render in background
        t = threading.Thread(target=run_render, args=(body,), daemon=True)
        t.start()

    def handle_download(self):
        if not render_status.get("output") or not os.path.exists(render_status["output"]):
            self.send_error(404, "No rendered file")
            return
        fpath = render_status["output"]
        fsize = os.path.getsize(fpath)
        self.send_response(200)
        self.send_header("Content-Type", "video/mp4")
        fname = os.path.basename(fpath)
        self.send_header("Content-Disposition", f'attachment; filename="{fname}"')
        self.send_header("Content-Length", fsize)
        self.end_headers()
        with open(fpath, "rb") as f:
            shutil.copyfileobj(f, self.wfile)


def get_video_duration(path):
    try:
        r = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", path],
            capture_output=True, text=True
        )
        return float(json.loads(r.stdout)["format"]["duration"])
    except:
        return 0.0


def is_video_landscape(path):
    """Check if video has landscape aspect ratio (width > height)."""
    try:
        r = subprocess.run(
            ["ffprobe", "-v", "quiet", "-select_streams", "v:0",
             "-show_entries", "stream=width,height", "-of", "csv=p=0", path],
            capture_output=True, text=True
        )
        parts = r.stdout.strip().split(",")
        if len(parts) >= 2:
            w, h = int(parts[0]), int(parts[1])
            return w > h
    except:
        pass
    return False


def get_video_fps(path):
    try:
        r = subprocess.run(
            ["ffprobe", "-v", "quiet", "-select_streams", "v:0",
             "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", path],
            capture_output=True, text=True
        )
        fps_str = r.stdout.strip().split(",")[0]  # e.g. "60/1" or "30000/1001"
        if "/" in fps_str:
            num, den = fps_str.split("/")
            return round(int(num) / int(den))
        return round(float(fps_str))
    except:
        return 30


def run_analyze(files, options):
    """Run thread_video_cutter.py --dry-run to get clip analysis, then generate subtitles."""
    try:
        # Validate files exist
        paths = []
        for f in files:
            p = BASE / f
            if not p.exists():
                raise FileNotFoundError(f"파일 없음: {f}")
            paths.append(str(p))
        
        max_dur = options.get("maxDuration", 60)
        clip_min = options.get("clipMin", 1.5)
        clip_max = options.get("clipMax", 8)
        scene_threshold = options.get("sceneThreshold", 0.3)
        num_sources = len(paths)
        
        # Smart parameter tuning — same logic as manual editing
        # 1. Calculate top-n per source to ensure even distribution
        avg_clip_dur = (clip_min + clip_max) / 2
        total_clips_needed = int(max_dur / avg_clip_dur) + 1
        top_n = max(2, total_clips_needed // num_sources)
        
        # 2. Adjust clip-max based on target duration
        if max_dur <= 15:
            clip_max = min(clip_max, 3)
        elif max_dur <= 30:
            clip_max = min(clip_max, 4)
        
        with analyze_lock:
            analyze_status["progress"] = f"장면 분석 중... ({num_sources}개 영상, 소스당 {top_n}클립)"
        
        # Run cutter with smart params
        cmd = [
            sys.executable, str(CUTTER_SCRIPT),
            "--dry-run",
            "-d", str(max_dur),
            "--clip-min", str(clip_min),
            "--clip-max", str(clip_max),
            "--scene-threshold", str(scene_threshold),
            "--top-n", str(top_n),
            *paths
        ]
        
        print(f"[Analyze] Smart params: top_n={top_n}, clip_max={clip_max}, target={max_dur}s")
        print(f"[Analyze] Running: {' '.join(cmd[:12])}...")
        r = subprocess.run(cmd, capture_output=True, text=True, cwd=str(BASE))
        
        if r.returncode != 0:
            raise RuntimeError(f"분석 실패: {r.stderr[-500:]}")
        
        # Parse JSON from output
        clips = []
        subs = []
        output = r.stdout.strip()
        json_start = output.find("[")
        if json_start >= 0:
            json_str = output[json_start:]
            try:
                clips = json.loads(json_str)
            except json.JSONDecodeError:
                bracket_count = 0
                for i, ch in enumerate(json_str):
                    if ch == "[": bracket_count += 1
                    elif ch == "]": bracket_count -= 1
                    if bracket_count == 0:
                        try:
                            clips = json.loads(json_str[:i+1])
                        except:
                            pass
                        break
        
        if not clips:
            import re
            for line in output.split("\n"):
                m = re.match(r'\s*\d+\.\s+\[(.+?)\]\s+([\d.]+)s?\s*~\s*([\d.]+)s?\s*\(.*?score[=:]?\s*([\d.]+)', line)
                if m:
                    clips.append({
                        "source": m.group(1).strip(),
                        "start": float(m.group(2)),
                        "end": float(m.group(3)),
                        "score": float(m.group(4)),
                        "source_idx": 0
                    })
        
        print(f"[Analyze] Parsed {len(clips)} clips")
        
        # Post-processing: ensure all sources are represented
        source_names = [Path(p).name for p in paths]
        sources_in_clips = set(c["source"] for c in clips)
        missing = [s for s in source_names if s not in sources_in_clips]
        
        if missing:
            with analyze_lock:
                analyze_status["progress"] = f"누락 소스 보충 중... ({len(missing)}개)"
            
            # Run additional analysis for missing sources
            for ms in missing:
                ms_path = str(BASE / ms)
                cmd2 = [
                    sys.executable, str(CUTTER_SCRIPT),
                    "--dry-run", "-d", str(clip_max * 2),
                    "--clip-min", str(clip_min), "--clip-max", str(clip_max),
                    "--top-n", "2",
                    ms_path
                ]
                r2 = subprocess.run(cmd2, capture_output=True, text=True, cwd=str(BASE))
                out2 = r2.stdout.strip()
                js2 = out2.find("[")
                if js2 >= 0:
                    try:
                        extra = json.loads(out2[js2:])
                        clips.extend(extra[:2])
                        print(f"[Analyze] Added {min(2,len(extra))} clips from missing source: {ms}")
                    except:
                        pass
        
        # Re-interleave: distribute clips evenly across sources
        with analyze_lock:
            analyze_status["progress"] = "클립 배치 최적화 중..."
        
        # Group by source
        by_source = {}
        for c in clips:
            by_source.setdefault(c["source"], []).append(c)
        
        # Round-robin interleave
        interleaved = []
        source_order = [Path(p).name for p in paths]  # respect user's ordering
        source_iters = {s: iter(by_source.get(s, [])) for s in source_order}
        
        total_dur = 0
        rounds = 0
        max_rounds = 20
        while total_dur < max_dur and rounds < max_rounds:
            added = False
            for s in source_order:
                if total_dur >= max_dur:
                    break
                try:
                    c = next(source_iters[s])
                    dur = c["end"] - c["start"]
                    if total_dur + dur <= max_dur + 2:  # small overflow ok
                        interleaved.append(c)
                        total_dur += dur
                        added = True
                except StopIteration:
                    continue
            if not added:
                break
            rounds += 1
        
        clips = interleaved
        
        # Assign source_idx
        src_names = list(dict.fromkeys(c["source"] for c in clips))
        for c in clips:
            c["source_idx"] = src_names.index(c["source"]) if c["source"] in src_names else 0
        
        print(f"[Analyze] Final: {len(clips)} clips, {total_dur:.1f}s, {len(set(c['source'] for c in clips))} sources")
        
        # Assign source_idx
        src_names = list(dict.fromkeys(c["source"] for c in clips))
        for c in clips:
            c["source_idx"] = src_names.index(c["source"]) if c["source"] in src_names else 0
        
        # Subtitle generation
        sub_mode = options.get("subtitleMode", "0")
        context = options.get("context", "")
        
        client_api_key = options.get("apiKey", "")
        
        if sub_mode == "context" and context:
            with analyze_lock:
                analyze_status["progress"] = "자막 생성 중 (AI)..."
            try:
                subs = generate_context_subs(clips, context, client_api_key)
            except Exception as e:
                print(f"[Analyze] Context subtitle failed: {e}")
                subs = [""] * len(clips)
        elif sub_mode == "whisper":
            with analyze_lock:
                analyze_status["progress"] = "자막 생성 중 (Whisper)..."
            try:
                subs = generate_auto_subs(clips, options.get("subLang", "ko"))
            except Exception as e:
                print(f"[Analyze] Whisper subtitle failed: {e}")
                subs = [""] * len(clips)
        else:
            subs = [""] * len(clips)
        
        with analyze_lock:
            analyze_status.update(
                state="done",
                progress="완료",
                result={"clips": clips, "subs": subs}
            )
        print(f"[Analyze] ✅ Done: {len(clips)} clips")
        
    except Exception as e:
        with analyze_lock:
            analyze_status.update(state="error", error=str(e))
        print(f"[Analyze] ❌ Error: {e}")


def generate_context_subs(clips, context, api_key_from_client=""):
    """Generate subtitles based on user context prompt using OpenAI/Anthropic API."""
    import urllib.request
    
    clip_info = []
    for i, c in enumerate(clips):
        dur = c["end"] - c["start"]
        clip_info.append(f"클립{i+1}: {c['source']} ({c['start']:.1f}~{c['end']:.1f}초, {dur:.1f}초)")
    
    prompt = f"""다음은 영상 편집 프로젝트의 클립 목록입니다.

사용자 설명: {context}

클립 목록:
{chr(10).join(clip_info)}

각 클립에 맞는 자막을 생성해주세요.
규칙:
- 각 클립당 정확히 1줄 자막
- 짧고 임팩트 있게 (한 문장)
- 사용자가 설명한 톤/분위기에 맞게
- {len(clips)}줄을 정확히 출력 (클립 수와 동일)
- 번호 없이 자막 텍스트만 한 줄씩 출력
- 이모지(emoji)는 절대 사용하지 마세요. 텍스트만 작성하세요.
- 자막 전체 흐름은 기승전결 구조를 따르세요:
  - 기(도입): 호기심을 유발하는 시작
  - 승(전개): 내용을 구체적으로 풀어가기
  - 전(전환): 반전이나 임팩트 포인트
  - 결(마무리): 여운을 남기는 마무리

자막:"""

    # Detect key type from client-provided key
    client_key = api_key_from_client or ""
    
    # Try OpenAI API
    api_key = client_key if client_key.startswith("sk-") and not client_key.startswith("sk-ant-") else os.environ.get("OPENAI_API_KEY", "")
    if api_key and not api_key.startswith("sk-ant-"):
        try:
            data = json.dumps({
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.8
            }).encode()
            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=data,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read())
                text = result["choices"][0]["message"]["content"].strip()
                lines = [l.strip() for l in text.split("\n") if l.strip()]
                # Pad or trim to match clip count
                while len(lines) < len(clips):
                    lines.append("")
                return lines[:len(clips)]
        except Exception as e:
            print(f"[Subs] OpenAI API failed: {e}")
    
    # Try Anthropic API
    api_key = client_key if client_key.startswith("sk-ant-") else os.environ.get("ANTHROPIC_API_KEY", "")
    if api_key:
        try:
            data = json.dumps({
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": prompt}]
            }).encode()
            req = urllib.request.Request(
                "https://api.anthropic.com/v1/messages",
                data=data,
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json"
                }
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read())
                text = result["content"][0]["text"].strip()
                lines = [l.strip() for l in text.split("\n") if l.strip()]
                while len(lines) < len(clips):
                    lines.append("")
                return lines[:len(clips)]
        except Exception as e:
            print(f"[Subs] Anthropic API failed: {e}")
    
    # Fallback: use local LLM via ollama or openclaw
    try:
        # Try ollama
        data = json.dumps({
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }).encode()
        req = urllib.request.Request(
            "http://localhost:11434/api/generate",
            data=data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
            text = result.get("response", "").strip()
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            while len(lines) < len(clips):
                lines.append("")
            return lines[:len(clips)]
    except Exception as e:
        print(f"[Subs] Ollama failed: {e}")
    
    print("[Subs] No LLM available, generating placeholder subtitles")
    return [f"" for _ in clips]


def generate_auto_subs(clips, language="ko"):
    """Generate subtitle text per clip using Whisper."""
    subs = []
    try:
        import whisper
        model = whisper.load_model("base")
        
        for i, clip in enumerate(clips):
            src = BASE / Path(clip["source"]).name
            # Extract clip audio to temp file
            tmp_wav = BASE / f"_tmp_sub_{i}.wav"
            subprocess.run([
                "ffmpeg", "-y", "-ss", str(clip["start"]), "-t", str(clip["end"] - clip["start"]),
                "-i", str(src), "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
                str(tmp_wav)
            ], capture_output=True)
            
            if tmp_wav.exists():
                result = model.transcribe(str(tmp_wav), language=language)
                text = result.get("text", "").strip()
                subs.append(text)
                tmp_wav.unlink(missing_ok=True)
            else:
                subs.append("")
    except ImportError:
        print("[Analyze] Whisper not available, skipping auto-subtitle")
        subs = [""] * len(clips)
    except Exception as e:
        print(f"[Analyze] Whisper error: {e}")
        subs = [""] * len(clips)
    
    return subs


def run_render(data):
    clips = data["clips"]
    output_fps = data.get("fps", 30)
    tmp_dir = BASE / "_render_tmp"
    tmp_dir.mkdir(exist_ok=True)
    tmp_files = []

    try:
        for i, clip in enumerate(clips):
            src = BASE / Path(clip["source"]).name
            if not src.exists():
                raise FileNotFoundError(f"Source not found: {src}")

            speed = clip.get("speed", 1)
            crop = clip.get("crop", {"x": 0, "y": 0, "w": 100, "h": 100})
            zoom = clip.get("zoom", {"scale": 1, "panX": 0, "panY": 0})
            start = clip["start"]
            end = clip["end"]
            dur = (end - start) / speed
            tmp_out = tmp_dir / f"clip_{i:03d}.mp4"
            tmp_files.append(tmp_out)

            # Detect if source is landscape
            is_landscape = is_video_landscape(str(src))

            # Build filter chain
            filters = []

            # Speed
            if speed != 1:
                filters.append(f"setpts={1/speed:.4f}*PTS")

            # Normalize fps (all clips must have same fps for concat)
            filters.append(f"fps={output_fps}")

            # Scale to output — letterbox with blur bg for landscape sources
            if is_landscape and not (zoom["scale"] != 1 or zoom["panX"] != 0 or zoom["panY"] != 0):
                # Use filter_complex: blur bg + contain overlay
                speed_filter = f"setpts={1/speed:.4f}*PTS," if speed != 1 else ""
                fc = (
                    f"{speed_filter}fps={output_fps},"
                    f"split[main][bg];"
                    f"[bg]scale={W}:{H}:force_original_aspect_ratio=increase,"
                    f"crop={W}:{H},boxblur=20:5[blurred];"
                    f"[main]scale={W}:{H}:force_original_aspect_ratio=decrease[fg];"
                    f"[blurred][fg]overlay=(W-w)/2:(H-h)/2"
                )
                cmd = [
                    "ffmpeg", "-y",
                    "-ss", f"{start:.3f}", "-t", f"{end-start:.3f}",
                    "-i", str(src),
                    "-filter_complex", fc,
                    "-c:v", "libx264", "-preset", "fast", "-crf", "18",
                    "-an", "-t", f"{dur:.3f}",
                    str(tmp_out)
                ]
                print(f"[Render] Clip {i+1}/{len(clips)} (letterbox): {' '.join(cmd)}")
                r = subprocess.run(cmd, capture_output=True, text=True)
                if r.returncode != 0:
                    raise RuntimeError(f"Clip {i+1} failed: {r.stderr[-500:]}")
                with render_lock:
                    render_status["progress"] = i + 1
                continue
            else:
                filters.append(f"scale={W}:{H}:force_original_aspect_ratio=increase")
                filters.append(f"crop={W}:{H}")

            # Zoom
            if zoom["scale"] != 1 or zoom["panX"] != 0 or zoom["panY"] != 0:
                zw = int(W * zoom["scale"])
                zh = int(H * zoom["scale"])
                zx = max(0, int((zw - W) / 2 - (zoom["panX"] / 100) * W))
                zy = max(0, int((zh - H) / 2 - (zoom["panY"] / 100) * H))
                filters.append(f"scale={zw}:{zh}")
                filters.append(f"crop={W}:{H}:{zx}:{zy}")

            # Crop (mask with black)
            has_crop = crop["x"] != 0 or crop["y"] != 0 or crop["w"] != 100 or crop["h"] != 100
            if has_crop:
                cx = int(crop["x"] / 100 * W)
                cy = int(crop["y"] / 100 * H)
                cw = int(crop["w"] / 100 * W)
                ch = int(crop["h"] / 100 * H)
                pre = ",".join(filters) + "," if filters else ""
                fc = (
                    f"{pre}split[orig][bg];"
                    f"[bg]drawbox=x=0:y=0:w={W}:h={H}:c=black:t=fill[black];"
                    f"[orig]crop={cw}:{ch}:{cx}:{cy}[cropped];"
                    f"[black][cropped]overlay={cx}:{cy}"
                )
                cmd = [
                    "ffmpeg", "-y",
                    "-ss", f"{start:.3f}", "-t", f"{end-start:.3f}",
                    "-i", str(src),
                    "-filter_complex", fc,
                    "-c:v", "libx264", "-preset", "fast", "-crf", "18",
                    "-an", "-t", f"{dur:.3f}",
                    str(tmp_out)
                ]
            else:
                vf = ",".join(filters)
                cmd = [
                    "ffmpeg", "-y",
                    "-ss", f"{start:.3f}", "-t", f"{end-start:.3f}",
                    "-i", str(src),
                    "-vf", vf,
                    "-c:v", "libx264", "-preset", "fast", "-crf", "18",
                    "-an", "-t", f"{dur:.3f}",
                    str(tmp_out)
                ]

            print(f"[Render] Clip {i+1}/{len(clips)}: {' '.join(cmd)}")
            r = subprocess.run(cmd, capture_output=True, text=True)
            if r.returncode != 0:
                raise RuntimeError(f"Clip {i+1} failed: {r.stderr[-500:]}")

            with render_lock:
                render_status["progress"] = i + 1

        # Concat
        concat_file = tmp_dir / "concat.txt"
        with open(concat_file, "w") as f:
            for tf in tmp_files:
                f.write(f"file '{tf}'\n")

        merged = tmp_dir / "merged.mp4"
        cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_file),
               "-c:v", "libx264", "-preset", "fast", "-crf", "18",
               "-r", str(output_fps),
               "-pix_fmt", "yuv420p",
               str(merged)]
        print(f"[Render] Concat: {' '.join(cmd)}")
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            raise RuntimeError(f"Concat failed: {r.stderr[-500:]}")

        # Subtitles — global subtitle support
        subs = []
        subtitles_enabled = data.get("subtitlesEnabled", True)
        
        if subtitles_enabled:
            # Prefer globalSubs (new format: [{text, style, start, end}])
            global_subs = data.get("globalSubs", [])
            if global_subs:
                for gs in global_subs:
                    text = gs.get("text", "")
                    style = gs.get("style", {"size": 16, "x": 50, "y": 80})
                    start = gs.get("start", 0)
                    end = gs.get("end", 0)
                    if text and end > start:
                        subs.append((start, end, text, style))
            else:
                # Fallback: legacy clip-based subtitles
                t_offset = 0
                for i, clip in enumerate(clips):
                    speed = clip.get("speed", 1)
                    dur = (clip["end"] - clip["start"]) / speed
                    clip_subs = clip.get("subtitles", [])
                    legacy_sub = clip.get("subtitle", "")
                    if not clip_subs and legacy_sub:
                        clip_subs = [{"text": legacy_sub, "style": None}]
                    for sub_entry in clip_subs:
                        if isinstance(sub_entry, str):
                            sub_text = sub_entry
                            sub_style = clip.get("subStyle", {"size": 16, "x": 50, "y": 80})
                        elif isinstance(sub_entry, dict):
                            sub_text = sub_entry.get("text", "")
                            sub_style = sub_entry.get("style") or clip.get("subStyle", {"size": 16, "x": 50, "y": 80})
                        else:
                            continue
                        if sub_text:
                            subs.append((t_offset, t_offset + dur, sub_text, sub_style))
                    t_offset += dur

        max_dur = data.get("maxDuration", 0)
        suffix = f"_{max_dur}s" if max_dur else ""
        output = BASE / f"edited_output{suffix}.mp4"

        if subs:
            # Render each subtitle as a PNG image, then overlay with enable timing
            sub_pngs = []
            overlay_inputs = []
            overlay_filters = []

            for idx, (st, en, text, ss) in enumerate(subs):
                SCALE = 3.5  # preview → 1080p scale factor
                font_size = int(ss.get("size", 16) * SCALE)
                sx = ss.get("x", 50)
                sy = ss.get("y", 80)

                png_path = tmp_dir / f"sub_{idx:03d}.png"
                print(f"[Sub {idx}] text={text}, stroke={ss.get('stroke')}, strokeColor={ss.get('strokeColor')}, strokeWidth={ss.get('strokeWidth')}")
                img_w, img_h = render_subtitle_image(text, font_size, str(png_path), W, H, style=ss)
                sub_pngs.append(png_path)

                # Position: center the PNG at (sx%, sy%) of frame
                ox = int(sx / 100 * W - img_w / 2)
                oy = int(sy / 100 * H - img_h / 2)
                ox = max(0, min(W - img_w, ox))
                oy = max(0, min(H - img_h, oy))

                overlay_inputs.extend(["-i", str(png_path)])

                # Build overlay chain
                if idx == 0:
                    prev = "0:v"
                else:
                    prev = f"v{idx}"
                out_label = f"v{idx+1}"

                overlay_filters.append(
                    f"[{prev}][{idx+1}:v]overlay={ox}:{oy}:enable='between(t,{st:.3f},{en:.3f})'[{out_label}]"
                )

            fc = ";".join(overlay_filters)
            final_label = f"v{len(subs)}"

            cmd = [
                "ffmpeg", "-y", "-i", str(merged),
                *overlay_inputs,
                "-filter_complex", fc,
                "-map", f"[{final_label}]",
                "-c:v", "libx264", "-preset", "fast", "-crf", "18",
                str(output)
            ]
            print(f"[Render] PNG overlay subs: {len(subs)} entries")
            r = subprocess.run(cmd, capture_output=True, text=True)
            if r.returncode != 0:
                raise RuntimeError(f"Subtitle burn failed: {r.stderr[-500:]}")
        else:
            shutil.copy2(merged, output)

        with render_lock:
            render_status.update(state="done", output=str(output))
        print(f"[Render] ✅ Done: {output}")

    except Exception as e:
        with render_lock:
            render_status.update(state="error", error=str(e))
        print(f"[Render] ❌ Error: {e}")
    finally:
        # Cleanup tmp
        shutil.rmtree(tmp_dir, ignore_errors=True)


EMOJI_RE = re.compile('['
    '\U0001F600-\U0001F64F'
    '\U0001F300-\U0001F5FF'
    '\U0001F680-\U0001F6FF'
    '\U0001F1E0-\U0001F1FF'
    '\U00002702-\U000027B0'
    '\U000024C2-\U0001F251'
    '\U0001F900-\U0001F9FF'
    '\U0001FA00-\U0001FA6F'
    '\U0001FA70-\U0001FAFF'
    '\U00002600-\U000026FF'
    '\U0000FE00-\U0000FE0F'
    '\U0000200D'
    '\U00002640-\U00002642'
    '\U0000203C-\U00003299'
    ']+', re.UNICODE)

EMOJI_FONT_PATH = "/System/Library/Fonts/Apple Color Emoji.ttc"

def render_subtitle_image(text, font_size, out_path, frame_w=1080, frame_h=1920, style=None):
    """Render a subtitle as a transparent PNG with optional background box and custom style."""
    style = style or {}
    
    # Font selection — must support Korean (CJK) if text contains Korean
    has_cjk = bool(re.search(r'[\uAC00-\uD7AF\u3130-\u318F\u4E00-\u9FFF]', text))
    
    font_family = style.get("font", "")
    font_path = FONT_PATH  # default: Apple SD Gothic (Korean support)
    
    HOME = Path.home()
    UFONTS = HOME / "Library" / "Fonts"
    
    # Font registry: name → [paths] (ordered by preference)
    FONT_MAP = {
        # Korean Gothic (sans-serif)
        "Apple SD":     ["/System/Library/Fonts/AppleSDGothicNeo.ttc"],
        "Noto Sans KR": [str(UFONTS / "NotoSansKR-Bold.ttf"), str(UFONTS / "NotoSansKR-Medium.ttf"), "/System/Library/Fonts/Supplemental/NotoSansCJKkr-Regular.otf"],
        "Binggrae":     [str(UFONTS / "Binggrae.otf")],
        "Samanco":      [str(UFONTS / "BinggraeSamanco.otf")],
        "ONE Mobile":   [str(UFONTS / "ONE Mobile OTF Bold.otf"), str(UFONTS / "ONE Mobile OTF Regular.otf")],
        "HDharmony":    [str(UFONTS / "현대하모니+B.ttf"), str(UFONTS / "현대하모니+M.ttf")],
        # Korean Serif
        "Myungjo":      ["/System/Library/Fonts/AppleMyungjo.ttc"],
        "Gowun Batang": [str(UFONTS / "GowunBatang-Bold.ttf"), str(UFONTS / "GowunBatang-Regular.ttf")],
        "Batang":       ["/System/Library/Fonts/Supplemental/Batang.ttc"],
        # Handwriting / Display
        "HSYuji":       [str(UFONTS / "HS유지체.otf")],
        "Gotgam":       [str(UFONTS / "SANGJU Gotgam.otf")],
        "Dajungdagam":  [str(UFONTS / "SANGJU Dajungdagam.otf")],
        "Gyeongcheon":  [str(UFONTS / "SANGJU Gyeongcheon Island.otf")],
        "Recipekorea":  [str(UFONTS / "Recipekorea 饭内眉 FONT.otf")],
        "MBC 1961":     [str(UFONTS / "MBC 1961 OTF M.otf"), str(UFONTS / "MBC 1961굴림 OTF M.otf")],
        # Latin only (no Korean)
        "Impact":       ["/System/Library/Fonts/Supplemental/Impact.ttf"],
        "Courier":      ["/System/Library/Fonts/Courier.ttc"],
        "Georgia":      ["/System/Library/Fonts/Supplemental/Georgia.ttf"],
        "Arial":        ["/System/Library/Fonts/Supplemental/Arial.ttf"],
    }
    
    NO_CJK = {"Impact", "Courier", "Georgia", "Arial"}
    
    # Match font family string to registry key
    selected = None
    match_map = [
        ("Samanco", "Samanco"), ("Binggrae", "Binggrae"),
        ("ONE Mobile", "ONE Mobile"), ("HDharmony", "HDharmony"), ("현대하모니", "HDharmony"),
        ("Gowun Batang", "Gowun Batang"), ("고운바탕", "Gowun Batang"),
        ("Batang", "Batang"), ("바탕", "Batang"),
        ("Myungjo", "Myungjo"), ("명조", "Myungjo"),
        ("HSYuji", "HSYuji"), ("유지", "HSYuji"),
        ("Gotgam", "Gotgam"), ("곶감", "Gotgam"),
        ("Dajungdagam", "Dajungdagam"), ("다정다감", "Dajungdagam"),
        ("Gyeongcheon", "Gyeongcheon"), ("경천섬", "Gyeongcheon"),
        ("Recipekorea", "Recipekorea"), ("레시피", "Recipekorea"),
        ("MBC", "MBC 1961"),
        ("Noto Sans KR", "Noto Sans KR"), ("Noto", "Noto Sans KR"),
        ("Impact", "Impact"), ("Courier", "Courier"),
        ("Georgia", "Georgia"), ("Arial", "Arial"),
    ]
    for keyword, key in match_map:
        if keyword in font_family:
            selected = key
            break
    
    if selected:
        if selected in NO_CJK and has_cjk:
            print(f"[Sub] Font '{selected}' doesn't support Korean, falling back to default")
        else:
            for p in FONT_MAP.get(selected, []):
                if Path(p).exists():
                    font_path = p
                    break
    
    try:
        font = ImageFont.truetype(font_path, font_size)
    except:
        font = ImageFont.load_default()
    
    # Parse colors
    def hex_to_rgba(hex_color, alpha=1.0):
        hex_color = hex_color.lstrip('#')
        if len(hex_color) == 6:
            r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
            return (r, g, b, int(alpha * 255))
        return (255, 255, 255, 255)
    
    text_color = hex_to_rgba(style.get("color", "#ffffff"))
    show_bg = style.get("bg", True)
    if isinstance(show_bg, str):
        show_bg = True  # Legacy: string bg means enabled
    bg_color_hex = style.get("bgColor", "#000000")
    bg_alpha = style.get("bgAlpha", 0.6)
    if not isinstance(bg_alpha, (int, float)):
        bg_alpha = 0.6
    bg_color = hex_to_rgba(bg_color_hex, bg_alpha) if show_bg else (0, 0, 0, 0)
    
    # Measure text
    has_emoji = bool(EMOJI_RE.search(text))
    dummy = Image.new("RGBA", (1, 1))
    dd = ImageDraw.Draw(dummy)
    
    if has_emoji and HAS_PILMOJI:
        # pilmoji: measure with Pilmoji for accurate emoji sizing
        with Pilmoji(dummy) as pilmoji:
            tw = pilmoji.getsize(text, font=font)[0]
            th = font_size + 10  # approximate height
        bbox = (0, 0, tw, th)
    else:
        bbox = dd.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    
    # Fixed padding scaled to 1080p (preview phone ~310px wide → 1080px = ~3.5x)
    # Preview CSS: padding 4px 12px, border-radius 6px
    RENDER_SCALE = 3.5
    pad_h = int(12 * RENDER_SCALE)   # ~42px
    pad_v = int(4 * RENDER_SCALE)    # ~14px
    radius = int(6 * RENDER_SCALE)   # ~21px
    
    img_w = tw + pad_h * 2
    img_h = th + pad_v * 2
    
    img = Image.new("RGBA", (img_w, img_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    if show_bg:
        draw.rounded_rectangle(
            [(0, 0), (img_w - 1, img_h - 1)],
            radius=radius,
            fill=bg_color
        )
    
    tx = pad_h - bbox[0]
    ty = pad_v - bbox[1]
    
    # Check if text has emoji
    has_emoji = bool(EMOJI_RE.search(text))
    
    # Stroke (outline)
    show_stroke = style.get("stroke", False)
    stroke_color = hex_to_rgba(style.get("strokeColor", "#000000")) if show_stroke else None
    stroke_width = int(style.get("strokeWidth", 2) * RENDER_SCALE) if show_stroke else 0
    
    if has_emoji and HAS_PILMOJI:
        # Use pilmoji for proper color emoji rendering
        if show_stroke:
            # Draw stroke first, then emoji text on top
            draw.text((tx, ty), text, font=font, fill=text_color,
                      stroke_width=stroke_width, stroke_fill=stroke_color)
            # Overlay emoji with pilmoji (emoji only, text already drawn)
            with Pilmoji(img) as pilmoji:
                pilmoji.text((tx, ty), text, font=font, fill=text_color)
        else:
            with Pilmoji(img) as pilmoji:
                pilmoji.text((tx, ty), text, font=font, fill=text_color)
    else:
        if show_stroke:
            draw.text((tx, ty), text, font=font, fill=text_color,
                      stroke_width=stroke_width, stroke_fill=stroke_color)
        else:
            draw.text((tx, ty), text, font=font, fill=text_color)
    
    img.save(out_path, "PNG")
    return img_w, img_h


def ass_time(s):
    """Format seconds to ASS time: H:MM:SS.cc"""
    h = int(s // 3600)
    m = int(s % 3600 // 60)
    sec = int(s % 60)
    cs = int((s % 1) * 100)
    return f"{h}:{m:02d}:{sec:02d}.{cs:02d}"

def srt_time(s):
    h = int(s // 3600)
    m = int(s % 3600 // 60)
    sec = int(s % 60)
    ms = int((s % 1) * 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"


if __name__ == "__main__":
    import socketserver, signal
    if hasattr(signal, 'SIGPIPE'):
        signal.signal(signal.SIGPIPE, signal.SIG_IGN)

    class ThreadedServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
        allow_reuse_address = True
        daemon_threads = True

    server = ThreadedServer(("", PORT), Handler)
    print(f"🎬 Editor server at http://localhost:{PORT}/editor.html")
    server.serve_forever()
