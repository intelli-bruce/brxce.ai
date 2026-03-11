#!/usr/bin/env python3
"""
BrxceStudio 자동 영상 프로젝트 생성기

소스 영상 → ffprobe 분석 → Whisper 자막 → 프리셋 기반 클립 구성 → 프로젝트 저장

Usage:
  python3 auto-video-project.py \
    --preset day-in-life \
    --duration 30 \
    --name "일상 브이로그" \
    --auto-subtitle \
    --sub-lang ko \
    source1.MOV source2.MOV source3.MOV ...

  # 자막 없이
  python3 auto-video-project.py --preset montage --duration 15 source1.MOV source2.MOV

  # 특정 프리셋 + Whisper large 모델
  python3 auto-video-project.py --preset talking-head --auto-subtitle --whisper-model large talk.MOV

Presets: day-in-life, aesthetic, before-after, montage, talking-head, text-story
"""

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

# ─── Config ───
EDITOR_DIR = Path.home() / "Desktop/_개발/brxce.ai/apps/studio/public/video-editor"
PROJECTS_DIR = EDITOR_DIR / "_projects"
EDITOR_API = "http://localhost:8090"

# Also handle ~/Projects/brxce.ai symlink path
EDITOR_DIR_ALT = Path.home() / "Projects/brxce.ai/apps/studio/public/video-editor"

def get_editor_dir():
    """Find the actual editor directory."""
    if EDITOR_DIR.exists():
        return EDITOR_DIR
    if EDITOR_DIR_ALT.exists():
        # Follow symlink
        return EDITOR_DIR_ALT.resolve()
    return EDITOR_DIR  # fallback

# ─── Presets ───
PRESETS = {
    "day-in-life": {
        "clip_duration": (3, 5),   # min, max seconds per clip
        "subtitle_style": "감성",   # 짧은 감성 자막
        "speed_range": (0.9, 1.0),
        "zoom": False,
        "transition": "none",
    },
    "aesthetic": {
        "clip_duration": (4, 6),
        "subtitle_style": "최소",
        "speed_range": (0.6, 0.8),  # slow motion
        "zoom": True,
        "transition": "none",
    },
    "before-after": {
        "clip_duration": (3, 5),
        "subtitle_style": "라벨",
        "speed_range": (0.9, 1.0),
        "zoom": False,
        "transition": "none",
    },
    "montage": {
        "clip_duration": (1, 3),   # fast cuts
        "subtitle_style": "없음",
        "speed_range": (1.0, 1.2),
        "zoom": True,
        "transition": "none",
    },
    "talking-head": {
        "clip_duration": (5, 15),
        "subtitle_style": "전체",   # full whisper subtitles
        "speed_range": (1.0, 1.0),
        "zoom": False,
        "transition": "none",
    },
    "text-story": {
        "clip_duration": (3, 6),
        "subtitle_style": "스토리",
        "speed_range": (0.9, 1.0),
        "zoom": False,
        "transition": "none",
    },
}


def probe_video(path: str) -> dict:
    """Get video metadata via ffprobe."""
    cmd = [
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_format", "-show_streams", str(path)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return {}
    data = json.loads(result.stdout)
    
    duration = float(data.get("format", {}).get("duration", 0))
    
    # Find video stream
    width, height = 0, 0
    for s in data.get("streams", []):
        if s.get("codec_type") == "video":
            width = int(s.get("width", 0))
            height = int(s.get("height", 0))
            break
    
    # Check if has audio
    has_audio = any(s.get("codec_type") == "audio" for s in data.get("streams", []))
    
    return {
        "duration": duration,
        "width": width,
        "height": height,
        "has_audio": has_audio,
    }


def whisper_transcribe(path: str, lang: str = "ko", model: str = "base") -> list[dict]:
    """Run Whisper on a video file, return segments [{start, end, text}]."""
    try:
        import whisper
    except ImportError:
        print("⚠️  Whisper not installed. pip3 install openai-whisper")
        return []
    
    print(f"  🎤 Whisper ({model}) 실행 중: {Path(path).name}...")
    m = whisper.load_model(model)
    result = m.transcribe(str(path), language=lang, verbose=False)
    
    segments = []
    for seg in result.get("segments", []):
        segments.append({
            "start": seg["start"],
            "end": seg["end"],
            "text": seg["text"].strip(),
        })
    
    return segments


def detect_scenes(path: str, threshold: float = 0.3) -> list[float]:
    """Detect scene changes using ffmpeg."""
    cmd = [
        "ffmpeg", "-i", str(path), "-vf",
        f"select='gt(scene,{threshold})',showinfo",
        "-vsync", "vfr", "-f", "null", "-"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    times = [0.0]
    for line in result.stderr.split("\n"):
        if "pts_time:" in line:
            try:
                t = float(line.split("pts_time:")[1].split()[0])
                times.append(t)
            except (ValueError, IndexError):
                pass
    
    return sorted(set(times))


def generate_clips(
    sources: list[dict],
    preset: dict,
    target_duration: float,
    whisper_segments: dict[str, list[dict]] | None = None,
) -> list[dict]:
    """Generate clip list based on preset and source analysis."""
    clips = []
    clip_min, clip_max = preset["clip_duration"]
    speed_min, speed_max = preset["speed_range"]
    total = 0.0
    
    # Round-robin through sources
    src_idx = 0
    attempts = 0
    max_attempts = 100
    
    while total < target_duration and attempts < max_attempts:
        attempts += 1
        src = sources[src_idx % len(sources)]
        src_idx += 1
        
        src_dur = src["duration"]
        if src_dur < clip_min:
            continue
        
        # Pick a segment
        import random
        clip_len = min(random.uniform(clip_min, clip_max), src_dur)
        max_start = max(0, src_dur - clip_len)
        start = random.uniform(0, max_start)
        end = start + clip_len
        
        # If whisper segments exist for this source, find matching subtitle
        subtitle = ""
        src_name = src["name"]
        if whisper_segments and src_name in whisper_segments:
            segs = whisper_segments[src_name]
            for seg in segs:
                if seg["start"] >= start and seg["end"] <= end + 1:
                    subtitle = seg["text"]
                    break
            if not subtitle:
                # Find closest segment
                for seg in segs:
                    if seg["start"] <= end and seg["end"] >= start:
                        subtitle = seg["text"]
                        break
        
        speed = random.uniform(speed_min, speed_max)
        speed = round(speed, 2)
        
        zoom_data = {"scale": 1, "panX": 0, "panY": 0}
        if preset["zoom"]:
            zoom_data["scale"] = round(random.uniform(1.0, 1.3), 2)
        
        actual_dur = clip_len / speed
        if total + actual_dur > target_duration:
            # Trim to fit
            actual_dur = target_duration - total
            clip_len = actual_dur * speed
            end = start + clip_len
        
        clips.append({
            "source": src["name"],
            "start": round(start, 2),
            "end": round(end, 2),
            "subtitle": subtitle,
            "source_idx": (src_idx - 1) % len(sources),
            "speed": speed,
            "zoom": zoom_data,
        })
        
        total += actual_dur
        if total >= target_duration:
            break
    
    return clips


def scene_based_clips(
    sources: list[dict],
    preset: dict,
    target_duration: float,
    whisper_segments: dict[str, list[dict]] | None = None,
) -> list[dict]:
    """Generate clips using scene detection for smarter cuts."""
    all_scenes = []
    
    for src in sources:
        print(f"  🎬 장면 감지: {src['name']}...")
        scenes = detect_scenes(src["path"], threshold=0.3)
        scenes.append(src["duration"])  # Add end
        
        clip_min, clip_max = preset["clip_duration"]
        
        for i in range(len(scenes) - 1):
            seg_start = scenes[i]
            seg_end = scenes[i + 1]
            seg_dur = seg_end - seg_start
            
            if seg_dur < clip_min:
                continue
            if seg_dur > clip_max:
                seg_end = seg_start + clip_max
            
            # Find subtitle
            subtitle = ""
            if whisper_segments and src["name"] in whisper_segments:
                for seg in whisper_segments[src["name"]]:
                    if seg["start"] <= seg_end and seg["end"] >= seg_start:
                        subtitle = seg["text"]
                        break
            
            import random
            speed = round(random.uniform(*preset["speed_range"]), 2)
            zoom_data = {"scale": 1, "panX": 0, "panY": 0}
            if preset["zoom"]:
                zoom_data["scale"] = round(random.uniform(1.0, 1.3), 2)
            
            all_scenes.append({
                "source": src["name"],
                "start": round(seg_start, 2),
                "end": round(seg_end, 2),
                "subtitle": subtitle,
                "source_idx": sources.index(src),
                "speed": speed,
                "zoom": zoom_data,
                "duration": (seg_end - seg_start) / speed,
            })
    
    # Sort by quality/interest (longer scenes first for now) and fit duration
    import random
    random.shuffle(all_scenes)
    
    clips = []
    total = 0.0
    for scene in all_scenes:
        if total + scene["duration"] > target_duration:
            # Trim last clip
            remaining = target_duration - total
            if remaining > 0.5:
                trimmed = dict(scene)
                trimmed["end"] = trimmed["start"] + remaining * trimmed["speed"]
                trimmed["end"] = round(trimmed["end"], 2)
                del trimmed["duration"]
                clips.append(trimmed)
            break
        
        clip = dict(scene)
        del clip["duration"]
        clips.append(clip)
        total += scene["duration"]
    
    return clips


def save_project_api(project: dict) -> str | None:
    """Save project via server.py API."""
    try:
        data = json.dumps(project, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            f"{EDITOR_API}/api/projects/save",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            result = json.loads(resp.read())
            return result.get("id")
    except Exception as e:
        print(f"⚠️  API 저장 실패 ({e}), 파일로 직접 저장합니다.")
        return None


def save_project_file(project: dict) -> str:
    """Save project directly to _projects/ directory."""
    editor_dir = get_editor_dir()
    proj_dir = editor_dir / "_projects"
    proj_dir.mkdir(exist_ok=True)
    
    pid = project["id"]
    fpath = proj_dir / f"{pid}.json"
    fpath.write_text(json.dumps(project, ensure_ascii=False, indent=2))
    return str(fpath)


def symlink_sources(sources: list[dict]):
    """Symlink source videos to editor directory."""
    editor_dir = get_editor_dir()
    for src in sources:
        target = editor_dir / src["name"]
        if target.exists() or target.is_symlink():
            continue
        try:
            target.symlink_to(src["path"])
            print(f"  🔗 링크: {src['name']}")
        except Exception as e:
            print(f"  ⚠️  링크 실패 {src['name']}: {e}")


def main():
    parser = argparse.ArgumentParser(description="BrxceStudio 자동 영상 프로젝트 생성기")
    parser.add_argument("sources", nargs="+", help="소스 영상 파일들")
    parser.add_argument("--preset", "-p", default="day-in-life",
                        choices=list(PRESETS.keys()),
                        help="프리셋 (default: day-in-life)")
    parser.add_argument("--duration", "-d", type=float, default=30,
                        help="목표 길이 (초, default: 30)")
    parser.add_argument("--name", "-n", default=None,
                        help="프로젝트 이름")
    parser.add_argument("--auto-subtitle", action="store_true",
                        help="Whisper 자동 자막")
    parser.add_argument("--sub-lang", default="ko",
                        help="자막 언어 (default: ko)")
    parser.add_argument("--whisper-model", default="base",
                        help="Whisper 모델 (default: base)")
    parser.add_argument("--smart-cut", action="store_true",
                        help="장면 감지 기반 스마트 컷 (기본: 랜덤)")
    parser.add_argument("--dry-run", action="store_true",
                        help="프로젝트 생성만, 저장 안 함")
    parser.add_argument("--output-json", "-o", default=None,
                        help="프로젝트 JSON 파일 출력 경로")
    
    args = parser.parse_args()
    preset = PRESETS[args.preset]
    
    # 1. Analyze sources
    print(f"\n🎬 프리셋: {args.preset} | 목표: {args.duration}초\n")
    print("① 소스 영상 분석...")
    
    sources = []
    for path in args.sources:
        p = Path(path).resolve()
        if not p.exists():
            print(f"  ❌ 파일 없음: {path}")
            continue
        
        info = probe_video(str(p))
        if not info or info["duration"] < 0.5:
            print(f"  ❌ 유효하지 않은 영상: {path}")
            continue
        
        sources.append({
            "name": p.name,
            "path": str(p),
            **info,
        })
        print(f"  ✅ {p.name} — {info['duration']:.1f}초, {info['width']}x{info['height']}, 오디오: {'✓' if info['has_audio'] else '✗'}")
    
    if not sources:
        print("\n❌ 사용 가능한 소스 영상이 없습니다.")
        sys.exit(1)
    
    total_source = sum(s["duration"] for s in sources)
    print(f"\n  총 소스: {len(sources)}개, {total_source:.1f}초")
    
    # 2. Whisper subtitles (optional)
    whisper_segments = {}
    if args.auto_subtitle:
        print("\n② Whisper 자막 생성...")
        for src in sources:
            if src["has_audio"]:
                segs = whisper_transcribe(src["path"], args.sub_lang, args.whisper_model)
                if segs:
                    whisper_segments[src["name"]] = segs
                    print(f"  ✅ {src['name']}: {len(segs)}개 세그먼트")
            else:
                print(f"  ⏭️  {src['name']}: 오디오 없음, 스킵")
    else:
        print("\n② 자막: 스킵 (--auto-subtitle 없음)")
    
    # 3. Generate clips
    print(f"\n③ 클립 자동 구성 ({'스마트 컷' if args.smart_cut else '랜덤 컷'})...")
    
    if args.smart_cut:
        clips = scene_based_clips(sources, preset, args.duration, whisper_segments or None)
    else:
        clips = generate_clips(sources, preset, args.duration, whisper_segments or None)
    
    if not clips:
        print("  ❌ 클립을 생성할 수 없습니다.")
        sys.exit(1)
    
    total_dur = sum((c["end"] - c["start"]) / c.get("speed", 1) for c in clips)
    print(f"  ✅ {len(clips)}개 클립, 총 {total_dur:.1f}초")
    for i, c in enumerate(clips):
        sub_preview = c["subtitle"][:30] + "..." if len(c["subtitle"]) > 30 else c["subtitle"]
        print(f"    [{i+1}] {c['source']} {c['start']:.1f}~{c['end']:.1f}s (x{c.get('speed', 1)}) — {sub_preview or '(자막 없음)'}")
    
    # 4. Build project JSON
    pid = f"auto_{args.preset}_{int(time.time())}"
    project_name = args.name or f"{args.preset} 자동생성"
    
    project = {
        "id": pid,
        "name": project_name,
        "clips": [
            {
                "source": c["source"],
                "start": c["start"],
                "end": c["end"],
                "source_idx": c.get("source_idx", 0),
            }
            for c in clips
        ],
        "subs": [c["subtitle"] for c in clips],
        "clipMeta": [
            {
                "speed": c.get("speed", 1),
                "transition": preset["transition"],
                "transDur": 0.3,
            }
            for c in clips
        ],
        "clipSubStyles": [
            {"size": 16, "x": 50, "y": 80, "color": "#FFFFFF", "outlineColor": "#000000", "outline": 3}
            for _ in clips
        ],
        "clipCrops": [{"x": 0, "y": 0, "w": 100, "h": 100} for _ in clips],
        "clipZooms": [c.get("zoom", {"scale": 1, "panX": 0, "panY": 0}) for c in clips],
        "sources": list(set(c["source"] for c in clips)),
        "totalDuration": round(total_dur, 2),
    }
    
    if args.dry_run:
        print(f"\n④ 드라이런 — 프로젝트 JSON:")
        print(json.dumps(project, ensure_ascii=False, indent=2))
        return
    
    # 5. Symlink sources
    print(f"\n④ 소스 영상 심볼릭 링크...")
    symlink_sources(sources)
    
    # 6. Save project
    print(f"\n⑤ 프로젝트 저장...")
    
    # Try API first, fallback to file
    saved_id = save_project_api(project)
    if saved_id:
        print(f"  ✅ API 저장 완료: {saved_id}")
    else:
        fpath = save_project_file(project)
        print(f"  ✅ 파일 저장: {fpath}")
    
    if args.output_json:
        Path(args.output_json).write_text(json.dumps(project, ensure_ascii=False, indent=2))
        print(f"  📄 JSON 출력: {args.output_json}")
    
    print(f"\n✨ 완료! 편집기에서 확인하세요:")
    print(f"   http://localhost:3200/studio/video-edit")
    print(f"   프로젝트: {project_name} ({pid})")
    print()


if __name__ == "__main__":
    main()
