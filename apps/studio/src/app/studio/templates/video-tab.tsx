"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Film, Play, Scissors, Music, Type, Zap } from "lucide-react";

/* ═══════════════════════════════════════════════════════
   영상 편집 프리셋 — /studio/video-edit 편집기에서 바로 사용
   레퍼런스 영상 분석 기반으로 정의
   ═══════════════════════════════════════════════════════ */

export interface VideoPreset {
  id: string;
  name: string;
  description: string;
  /** 프리셋 특징 요약 */
  traits: string[];
  /** 추천 클립 수 */
  clipCount: string;
  /** 추천 길이 (초) */
  duration: string;
  /** 편집 스타일 */
  editStyle: string;
  /** 자막 스타일 */
  subtitleStyle: string;
  /** BGM 스타일 */
  bgmStyle: string;
  /** 아이콘 */
  icon: string;
  /** 컬러 */
  color: string;
  /** 영상 편집기에 전달할 기본 프로젝트 JSON */
  defaultProject: {
    name: string;
    clips: { source: string; start: number; end: number; subtitle: string; speed?: number; zoom?: { scale: number; panX: number; panY: number } }[];
    bgm?: string;
    fps?: number;
  };
  /** 레퍼런스 설명 */
  referenceNote: string;
}

const PRESETS: VideoPreset[] = [
  {
    id: "day-in-life",
    name: "일상 브이로그",
    description: "여러 일상 클립을 자막과 함께 이어붙여 하루를 보여주는 숏폼",
    traits: ["일상 클립 조합", "짧은 자막", "감성 BGM", "자연스러운 전환"],
    clipCount: "6~10개",
    duration: "15~30초",
    editStyle: "클립당 3~5초, 부드러운 컷 전환",
    subtitleStyle: "한 줄 감성 자막, 하단 중앙",
    bgmStyle: "Lo-fi / Acoustic / Chill",
    icon: "☀️",
    color: "#4ade80",
    defaultProject: {
      name: "일상 브이로그",
      clips: [
        { source: "", start: 0, end: 4, subtitle: "오늘도 어김없이 시작되는 하루" },
        { source: "", start: 0, end: 4, subtitle: "커피 한 잔의 여유" },
        { source: "", start: 0, end: 3, subtitle: "작업 모드 ON" },
        { source: "", start: 0, end: 4, subtitle: "점심은 간단하게" },
        { source: "", start: 0, end: 3, subtitle: "오후의 산책" },
        { source: "", start: 0, end: 4, subtitle: "하루를 마무리하며" },
      ],
      fps: 30,
    },
    referenceNote: "인스타 일상 릴스 스타일. 클립마다 짧은 감성 자막 + 잔잔한 BGM",
  },
  {
    id: "aesthetic",
    name: "감성 릴스",
    description: "시네마틱 B-roll + 감성 자막 + BGM. 무드 중심 숏폼",
    traits: ["시네마틱 B-roll", "슬로모션", "감성 텍스트", "무드 BGM"],
    clipCount: "4~8개",
    duration: "15~30초",
    editStyle: "슬로모션 + 줌인/아웃, 비트 싱크",
    subtitleStyle: "시적인 문장, 페이드 인/아웃",
    bgmStyle: "Cinematic / Ambient / Piano",
    icon: "✨",
    color: "#a78bfa",
    defaultProject: {
      name: "감성 릴스",
      clips: [
        { source: "", start: 0, end: 5, subtitle: "", speed: 0.7, zoom: { scale: 1.2, panX: 0, panY: 0 } },
        { source: "", start: 0, end: 4, subtitle: "순간을 담다", speed: 0.8 },
        { source: "", start: 0, end: 5, subtitle: "", speed: 0.6, zoom: { scale: 1.3, panX: 0, panY: 0 } },
        { source: "", start: 0, end: 4, subtitle: "여기, 지금", speed: 0.7 },
      ],
      fps: 30,
    },
    referenceNote: "시네마틱 무드. 슬로모션 + 줌 + 최소한의 텍스트",
  },
  {
    id: "before-after",
    name: "비포/애프터",
    description: "변화 과정을 보여주는 전후 비교 영상",
    traits: ["전후 비교", "극적 전환", "텍스트 오버레이", "임팩트 BGM"],
    clipCount: "2~6개",
    duration: "10~20초",
    editStyle: "Before 구간 → 전환 효과 → After 구간",
    subtitleStyle: "BEFORE/AFTER 라벨 + 설명 자막",
    bgmStyle: "Build-up → Drop",
    icon: "🔄",
    color: "#f59e0b",
    defaultProject: {
      name: "비포/애프터",
      clips: [
        { source: "", start: 0, end: 4, subtitle: "BEFORE" },
        { source: "", start: 0, end: 3, subtitle: "변화의 시작..." },
        { source: "", start: 0, end: 4, subtitle: "AFTER" },
      ],
      fps: 30,
    },
    referenceNote: "다이어트, 인테리어, 데스크 셋업, 메이크업 등 전후 변화 강조",
  },
  {
    id: "montage",
    name: "몽타주 릴스",
    description: "빠른 컷 전환 + 비트 싱크 BGM. 하이라이트 모음",
    traits: ["빠른 컷", "비트 싱크", "다이나믹 줌", "에너지 넘침"],
    clipCount: "8~15개",
    duration: "15~30초",
    editStyle: "클립당 1~3초, 비트에 맞춘 컷",
    subtitleStyle: "없거나 최소한의 키워드",
    bgmStyle: "Energetic / Trap / EDM",
    icon: "⚡",
    color: "#ef4444",
    defaultProject: {
      name: "몽타주 릴스",
      clips: [
        { source: "", start: 0, end: 2, subtitle: "" },
        { source: "", start: 0, end: 2, subtitle: "" },
        { source: "", start: 0, end: 1, subtitle: "" },
        { source: "", start: 0, end: 2, subtitle: "" },
        { source: "", start: 0, end: 2, subtitle: "" },
        { source: "", start: 0, end: 1, subtitle: "" },
        { source: "", start: 0, end: 2, subtitle: "" },
        { source: "", start: 0, end: 2, subtitle: "" },
      ],
      fps: 30,
    },
    referenceNote: "여행, 운동, 파티, 작업 하이라이트. 빠른 비트 + 짧은 클립 연속",
  },
  {
    id: "talking-head",
    name: "토킹 헤드",
    description: "카메라 정면 토크 + 자막 오버레이",
    traits: ["정면 토크", "큰 자막", "B-roll 삽입", "CTA"],
    clipCount: "1~3개 (메인 + B-roll)",
    duration: "30~60초",
    editStyle: "메인 토크 + 중간중간 B-roll 삽입",
    subtitleStyle: "큰 자막, 키워드 강조, 하단 배치",
    bgmStyle: "없거나 매우 작은 배경음",
    icon: "🗣️",
    color: "#3b82f6",
    defaultProject: {
      name: "토킹 헤드",
      clips: [
        { source: "", start: 0, end: 10, subtitle: "오늘 이야기하고 싶은 건..." },
        { source: "", start: 0, end: 5, subtitle: "(B-roll)" },
        { source: "", start: 0, end: 10, subtitle: "핵심은 이겁니다" },
        { source: "", start: 0, end: 5, subtitle: "팔로우하고 더 알아보세요!" },
      ],
      fps: 30,
    },
    referenceNote: "팁, 의견, 리뷰, 교육 콘텐츠. 자막이 핵심",
  },
  {
    id: "text-story",
    name: "텍스트 스토리",
    description: "영상 위에 텍스트로 스토리텔링. 후킹 → 전개 → CTA",
    traits: ["텍스트 중심", "스토리 구조", "후킹 문장", "CTA"],
    clipCount: "3~6개",
    duration: "15~30초",
    editStyle: "배경 영상 위에 텍스트 순차 등장",
    subtitleStyle: "큰 텍스트, 중앙 배치, 단계별 등장",
    bgmStyle: "Dramatic / Suspense / Motivational",
    icon: "📝",
    color: "#ec4899",
    defaultProject: {
      name: "텍스트 스토리",
      clips: [
        { source: "", start: 0, end: 4, subtitle: "이걸 모르면 손해입니다" },
        { source: "", start: 0, end: 5, subtitle: "사실은..." },
        { source: "", start: 0, end: 5, subtitle: "해결 방법은 의외로 간단합니다" },
        { source: "", start: 0, end: 4, subtitle: "지금 바로 시도해보세요" },
      ],
      fps: 30,
    },
    referenceNote: "텍스트가 주인공. 후킹 → 정보 전달 → CTA 구조",
  },
];

function PresetIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
      style={{ backgroundColor: color + "15" }}
    >
      {icon}
    </div>
  );
}

export default function VideoTab() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<VideoPreset | null>(null);
  const [availableVideos, setAvailableVideos] = useState<{ name: string; duration: number; size: number; fps: number }[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Open source selection modal
  const openSourcePicker = async (preset: VideoPreset) => {
    setSelectedPreset(preset);
    setSelectedVideos([]);
    setLoadingVideos(true);
    try {
      const res = await fetch("http://localhost:8090/api/list-videos");
      const data = await res.json();
      setAvailableVideos(data.videos || []);
    } catch {
      setAvailableVideos([]);
    }
    setLoadingVideos(false);
  };

  const toggleVideo = (name: string) => {
    setSelectedVideos((prev) =>
      prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]
    );
  };

  const applyPresetWithSources = () => {
    if (!selectedPreset) return;
    const project = { ...selectedPreset.defaultProject };
    
    if (selectedVideos.length > 0) {
      // Distribute selected videos across preset clips
      project.clips = project.clips.map((clip, i) => ({
        ...clip,
        source: selectedVideos[i % selectedVideos.length],
      }));
    }
    
    localStorage.setItem("brxce-video-preset", JSON.stringify(project));
    setSelectedPreset(null);
    router.push("/studio/video-edit");
  };

  const handleSelectPreset = (preset: VideoPreset) => {
    openSourcePicker(preset);
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="px-12 pt-10 pb-8 border-b border-white/[0.06]">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-black text-[#fafafa]">영상 편집 프리셋</h1>
            <p className="text-sm text-white/40 mt-2 leading-relaxed">
              프리셋을 선택하면 영상 편집기에 기본 구조가 적용됩니다 · 1080×1920
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/25">{PRESETS.length}개 프리셋</span>
            <button
              onClick={() => router.push("/studio/video-edit")}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#ff6b35] text-white hover:bg-[#ff5522] transition border-none cursor-pointer"
            >
              <Scissors className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              빈 프로젝트로 시작
            </button>
          </div>
        </div>
      </div>

      {/* Preset grid */}
      <div className="px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="group border border-[#1a1a1a] rounded-2xl bg-[#0c0c0c] hover:bg-[#111] hover:border-[#333] transition-all overflow-hidden cursor-pointer"
            >
              <div className="p-6">
                {/* Top row */}
                <div className="flex items-start gap-4 mb-4">
                  <PresetIcon icon={preset.icon} color={preset.color} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[#fafafa] mb-1">{preset.name}</h3>
                    <p className="text-xs text-white/40 leading-relaxed">{preset.description}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: preset.color + "20" }}>
                      <Play className="w-4 h-4 ml-0.5" style={{ color: preset.color }} />
                    </div>
                  </div>
                </div>

                {/* Traits */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {preset.traits.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                      style={{ backgroundColor: preset.color + "12", color: preset.color }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <MetaItem icon={<Film className="w-3.5 h-3.5" />} label="클립" value={preset.clipCount} />
                  <MetaItem icon={<Clock className="w-3.5 h-3.5" />} label="길이" value={preset.duration} />
                  <MetaItem icon={<Type className="w-3.5 h-3.5" />} label="자막" value={preset.subtitleStyle} />
                  <MetaItem icon={<Music className="w-3.5 h-3.5" />} label="BGM" value={preset.bgmStyle} />
                </div>

                {/* Edit style */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <Zap className="w-3.5 h-3.5 text-white/25 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-white/35 leading-relaxed">{preset.editStyle}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-white/[0.04] bg-white/[0.015]">
                <p className="text-[10px] text-white/25">{preset.referenceNote}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Source Selection Modal */}
      {selectedPreset && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          onClick={() => setSelectedPreset(null)}
        >
          <div
            className="bg-[#111] rounded-2xl w-[640px] max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 mb-2">
                <PresetIcon icon={selectedPreset.icon} color={selectedPreset.color} />
                <div>
                  <h3 className="text-lg font-bold text-[#fafafa]">{selectedPreset.name}</h3>
                  <p className="text-xs text-white/40">{selectedPreset.description}</p>
                </div>
              </div>
              <p className="text-sm text-white/50 mt-3">
                사용할 소스 영상을 선택하세요. 선택한 영상이 프리셋 클립에 자동 배분됩니다.
              </p>
              <p className="text-xs text-white/30 mt-1">
                추천 클립 수: {selectedPreset.clipCount} · 선택됨: {selectedVideos.length}개
              </p>
            </div>

            {/* Add external video */}
            <div className="px-4 pt-4">
              <button
                onClick={() => {
                  const path = prompt("외부 영상 파일 경로 (절대경로):");
                  if (!path) return;
                  fetch("http://localhost:8090/api/upload-external", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ path }),
                  })
                    .then((r) => r.json())
                    .then((d) => {
                      if (d.name) {
                        setAvailableVideos((prev) => [
                          ...prev,
                          { name: d.name, duration: d.duration || 0, size: d.size || 0, fps: d.fps || 30 },
                        ]);
                      }
                    })
                    .catch(() => alert("영상 추가 실패"));
                }}
                className="w-full py-2.5 rounded-lg border border-dashed border-[#333] text-xs text-white/40 hover:border-[#ff6b35] hover:text-[#ff6b35] transition"
              >
                + 외부 영상 추가 (파일 경로)
              </button>
            </div>

            {/* Video list */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingVideos ? (
                <div className="text-center text-white/30 py-10">영상 목록 로딩 중...</div>
              ) : availableVideos.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-white/30 mb-2">편집기 서버에 영상이 없습니다</p>
                  <p className="text-xs text-white/20">video-editor 폴더에 영상을 추가하세요</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableVideos.map((vid, vi) => {
                    const isSelected = selectedVideos.includes(vid.name);
                    const idx = selectedVideos.indexOf(vid.name);
                    return (
                      <button
                        key={`${vid.name}-${vi}`}
                        onClick={() => toggleVideo(vid.name)}
                        className={`relative text-left p-2 rounded-lg border transition text-xs ${
                          isSelected
                            ? "border-[#ff6b35] bg-[#ff6b35]/10"
                            : "border-[#222] bg-[#0a0a0a] hover:border-[#333]"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-[#ff6b35] text-white text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                        )}
                        {/* Thumbnail */}
                        <div className="w-full aspect-video rounded bg-[#111] mb-1.5 overflow-hidden">
                          <img
                            src={`http://localhost:8090/api/thumbnail/${encodeURIComponent(vid.name)}`}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        </div>
                        <span className="text-white/70 truncate block">{vid.name}</span>
                        <span className="text-white/30 block mt-0.5">{vid.duration.toFixed(1)}초 · {vid.size}MB</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-white/[0.06] flex gap-3 justify-end">
              <button
                onClick={() => {
                  // 소스 없이 바로 적용
                  localStorage.setItem("brxce-video-preset", JSON.stringify(selectedPreset.defaultProject));
                  setSelectedPreset(null);
                  router.push("/studio/video-edit");
                }}
                className="px-4 py-2 rounded-lg text-sm text-white/50 bg-[#1a1a1a] hover:bg-[#222]"
              >
                소스 없이 시작
              </button>
              <button
                onClick={() => setSelectedPreset(null)}
                className="px-4 py-2 rounded-lg text-sm text-white/50 bg-[#1a1a1a] hover:bg-[#222]"
              >
                취소
              </button>
              <button
                onClick={applyPresetWithSources}
                disabled={selectedVideos.length === 0}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#ff6b35] text-white hover:bg-[#ff5522] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                적용 ({selectedVideos.length}개 선택)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide */}
      <div className="px-12 py-8 border-t border-white/[0.06]">
        <h2 className="text-lg font-bold text-[#fafafa] mb-4">사용 방법</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GuideCard step="1" icon="🎯" title="프리셋 선택" desc="콘텐츠 유형에 맞는 프리셋을 선택하세요. 클립 구성과 자막이 자동 세팅됩니다." />
          <GuideCard step="2" icon="📹" title="소스 교체" desc="영상 편집기에서 각 클립의 소스 영상을 교체하고 자막을 수정하세요." />
          <GuideCard step="3" icon="🚀" title="렌더링" desc="편집 완료 후 렌더링 → MP4 다운로드 → 인스타/유튜브에 바로 업로드." />
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-white/20 mt-0.5">{icon}</span>
      <div>
        <p className="text-[9px] text-white/20 uppercase tracking-wider">{label}</p>
        <p className="text-[11px] text-white/45">{value}</p>
      </div>
    </div>
  );
}

function GuideCard({ step, icon, title, desc }: { step: string; icon: string; title: string; desc: string }) {
  return (
    <div className="p-5 rounded-xl bg-[#0c0c0c] border border-[#1a1a1a]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-[10px] text-white/20 font-mono">STEP {step}</span>
      </div>
      <h3 className="text-sm font-semibold text-white/80 mb-2">{title}</h3>
      <p className="text-xs text-white/35 leading-relaxed">{desc}</p>
    </div>
  );
}
