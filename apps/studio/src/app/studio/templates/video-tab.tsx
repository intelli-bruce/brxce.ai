"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Film, Play, Scissors, Music, Type, Zap, Eye, TrendingUp } from "lucide-react";

/* ═══════════════════════════════════════════════════════
   영상 편집 프리셋 — 레퍼런스 영상 분석 기반
   인스타그램 릴스/숏폼 20개 영상 패턴 분석 결과 적용
   ═══════════════════════════════════════════════════════ */

export interface VideoPreset {
  id: string;
  name: string;
  description: string;
  traits: string[];
  clipCount: string;
  duration: string;
  editStyle: string;
  subtitleStyle: string;
  bgmStyle: string;
  icon: string;
  color: string;
  /** 참고 레퍼런스 계정 */
  references: string[];
  defaultProject: {
    name: string;
    clips: { source: string; start: number; end: number; subtitle: string; speed?: number; zoom?: { scale: number; panX: number; panY: number } }[];
    globalSubs?: { text: string; start: number; end: number; style?: Record<string, unknown> }[];
    bgm?: string;
    fps?: number;
  };
  referenceNote: string;
}

const PRESETS: VideoPreset[] = [
  // ─── 1. Quick Office Flex (4~7초) ───
  // 레퍼런스: Hope Choi (4s), Trillionaire Life (7s), Solocreateurs (7s)
  // 패턴: 1~2 클립, 멋진 공간 한 장면, 자막 없거나 한 줄 해시태그
  {
    id: "quick-flex",
    name: "퀵 플렉스",
    description: "멋진 공간/셋업을 한 컷으로 보여주는 초단편. 자막 최소, 임팩트 최대.",
    traits: ["원 테이크", "시네마틱", "공간 자랑", "7초 이내"],
    clipCount: "1~2개",
    duration: "4~7초",
    editStyle: "1 클립 풀샷 또는 슬로우 팬 → 마지막 1초 블랙",
    subtitleStyle: "없거나 한 줄 짧은 감탄사",
    bgmStyle: "짧은 Cinematic hit / Whoosh",
    icon: "🏢",
    color: "#4ade80",
    references: ["Hope Choi", "The Trillionaire Life™", "Solocreateurs"],
    defaultProject: {
      name: "퀵 플렉스",
      clips: [
        { source: "", start: 0, end: 5, subtitle: "", speed: 0.85, zoom: { scale: 1.05, panX: 0, panY: -3 } },
        { source: "", start: 0, end: 2, subtitle: "", speed: 0.7 },
      ],
      globalSubs: [
        { text: "Office with a view", start: 1, end: 5, style: { size: 20, x: 50, y: 85, font: "'Apple SD Gothic Neo',sans-serif", bg: true, bgColor: "#000000", bgAlpha: 0.4, color: "#ffffff" } },
      ],
      fps: 30,
    },
    referenceNote: "Hope Choi 4s / Trillionaire Life 7s / Solocreateurs 7s — 오피스/데스크 원샷, 최소 편집",
  },

  // ─── 2. Morning Routine (7~11초) ───
  // 레퍼런스: Abdulla (7s), Wayne (10s), Jason Byers (11s), marisa (11s)
  // 패턴: 2~4 클립, 시간순, 텍스트 자막이 독립적으로 흐름
  {
    id: "morning-routine",
    name: "모닝 루틴",
    description: "아침 루틴/하루 시작을 시간순으로 보여주는 구조. 자막이 시간대를 안내.",
    traits: ["시간순 구성", "짧은 클립 조합", "텍스트 자막", "감성 BGM"],
    clipCount: "3~5개",
    duration: "7~15초",
    editStyle: "클립당 2~4초, 부드러운 컷 전환, 마지막 클립 약간 길게",
    subtitleStyle: "시간/행동 설명 자막, 하단 중앙, 클립마다 교체",
    bgmStyle: "Lo-fi / Acoustic / Soft Piano",
    icon: "☀️",
    color: "#f59e0b",
    references: ["Abdulla Ababaikere", "Wayne", "Jason Byers", "marisa"],
    defaultProject: {
      name: "모닝 루틴",
      clips: [
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 4, subtitle: "" },
      ],
      globalSubs: [
        { text: "4:30 AM — 일어나자마자", start: 0, end: 3, style: { size: 14, x: 50, y: 82, font: "'Apple SD Gothic Neo',sans-serif", bg: true, bgColor: "#000000", bgAlpha: 0.5, color: "#ffffff" } },
        { text: "커피 한 잔으로 시작", start: 3, end: 6, style: { size: 14, x: 50, y: 82, font: "'Apple SD Gothic Neo',sans-serif", bg: true, bgColor: "#000000", bgAlpha: 0.5, color: "#ffffff" } },
        { text: "오늘의 첫 번째 할 일", start: 6, end: 9, style: { size: 14, x: 50, y: 82, font: "'Apple SD Gothic Neo',sans-serif", bg: true, bgColor: "#000000", bgAlpha: 0.5, color: "#ffffff" } },
        { text: "하루가 시작된다", start: 9, end: 13, style: { size: 16, x: 50, y: 82, font: "'Apple SD Gothic Neo',sans-serif", bg: true, bgColor: "#000000", bgAlpha: 0.5, color: "#ffffff" } },
      ],
      fps: 30,
    },
    referenceNote: "Abdulla 7s (4:30AM 기상) / Wayne 10s (연초 다짐) / marisa 11s (오후 작업) — 시간순 루틴",
  },

  // ─── 3. Motivational Text Reel (11~17초) ───
  // 레퍼런스: alex (11s), Aryan (11s), Toktorov (15s), Angelo (15s), Dovydas (16s), Anhphu (17s)
  // 패턴: B-roll 영상 위에 텍스트가 핵심. 씬 전환 거의 없음 (1~3 컷), 자막이 스토리를 이끔
  {
    id: "motivational-text",
    name: "동기부여 텍스트",
    description: "B-roll 위에 텍스트로 메시지를 전달. 후킹 → 전개 → 펀치라인 구조.",
    traits: ["텍스트 중심", "B-roll 배경", "후킹→전개→결론", "스타트업/그라인드"],
    clipCount: "2~4개",
    duration: "11~17초",
    editStyle: "배경 1~3 클립, 씬 전환 최소, 텍스트가 주인공",
    subtitleStyle: "큰 텍스트 중앙, 단계별 등장, 키워드 강조",
    bgmStyle: "Dramatic / Dark Ambient / Cinematic",
    icon: "💪",
    color: "#ef4444",
    references: ["alex", "Aryan Khurana", "Toktorov Kurmanbek", "Angelo Castellani", "Dovydas Pinskus"],
    defaultProject: {
      name: "동기부여 텍스트",
      clips: [
        { source: "", start: 0, end: 5, subtitle: "", speed: 0.9 },
        { source: "", start: 0, end: 5, subtitle: "", speed: 0.85 },
        { source: "", start: 0, end: 5, subtitle: "", speed: 0.9 },
      ],
      globalSubs: [
        { text: "세상이 무너져도", start: 0, end: 4.5, style: { size: 22, x: 50, y: 40, font: "'Apple SD Gothic Neo',sans-serif", bg: false, bgColor: "#000000", bgAlpha: 0, color: "#ffffff" } },
        { text: "당신이 할 수 있는 건", start: 5, end: 9, style: { size: 22, x: 50, y: 40, font: "'Apple SD Gothic Neo',sans-serif", bg: false, bgColor: "#000000", bgAlpha: 0, color: "#ffffff" } },
        { text: "더 나은 삶을 위해\n계속 싸우는 것뿐이다", start: 10, end: 15, style: { size: 24, x: 50, y: 45, font: "'Apple SD Gothic Neo',sans-serif", bg: false, bgColor: "#000000", bgAlpha: 0, color: "#ffffff" } },
      ],
      fps: 30,
    },
    referenceNote: "alex 11s (keep fighting) / Angelo 15s (harsh truth) / Toktorov 15s (building from zero) — 텍스트가 핵심",
  },

  // ─── 4. Day-in-Life Montage (15~30초) ───
  // 레퍼런스: Dovydas (16s, scene change 거의 없음), Anhphu (17s), 牛马 (19s)
  // 패턴: 5~8 클립, 다양한 일상 장면, 빠른 컷, BGM 비트 싱크
  {
    id: "day-in-life",
    name: "일상 몽타주",
    description: "하루의 여러 장면을 빠르게 편집한 몽타주. 비트에 맞춘 컷 전환.",
    traits: ["빠른 컷 전환", "비트 싱크", "다양한 장면", "에너지"],
    clipCount: "6~10개",
    duration: "15~30초",
    editStyle: "클립당 2~4초, 비트에 맞춘 컷, 가끔 슬로모션",
    subtitleStyle: "한 줄 감성 자막 또는 없음",
    bgmStyle: "Lo-fi Hip Hop / Chill Trap / Indie",
    icon: "🎬",
    color: "#3b82f6",
    references: ["Dovydas Pinskus", "Anhphu Nguyen", "牛马的home"],
    defaultProject: {
      name: "일상 몽타주",
      clips: [
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 4, subtitle: "", speed: 0.8 },
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 4, subtitle: "", speed: 0.85 },
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 4, subtitle: "" },
      ],
      globalSubs: [
        { text: "오늘도 어김없이", start: 0, end: 3, style: { size: 14, x: 50, y: 85, font: "'Apple SD Gothic Neo',sans-serif", bg: true, bgColor: "#000000", bgAlpha: 0.5, color: "#ffffff" } },
        { text: "Never gets old", start: 24, end: 27, style: { size: 16, x: 50, y: 85, font: "Georgia,serif", bg: true, bgColor: "#000000", bgAlpha: 0.5, color: "#ffffff" } },
      ],
      fps: 30,
    },
    referenceNote: "Dovydas 16s (반복되는 일상의 행복) / Anhphu 17s (AI 도우미) / 牛马 19s (게이밍 공간) — 빠른 컷 몽타주",
  },

  // ─── 5. Space Tour / Office Tour (30~45초) ───
  // 레퍼런스: Toronto (14s), JAYDEN (45s), Net Kohen (38s)
  // 패턴: 많은 장면 전환 (JAYDEN 45s에서 19개 씬체인지), 공간 소개+자막
  {
    id: "space-tour",
    name: "공간 투어",
    description: "오피스/카페/셋업 공간을 여러 앵글로 소개. 씬 전환 많고 자막으로 설명.",
    traits: ["다앵글 촬영", "공간 소개", "설명 자막", "빈티지/감성"],
    clipCount: "8~15개",
    duration: "30~45초",
    editStyle: "클립당 2~4초, 같은 공간 다양한 앵글, 중간중간 디테일 샷",
    subtitleStyle: "위치/설명 자막, 가끔 상호명/주소 텍스트",
    bgmStyle: "Chill / Jazzy / Acoustic",
    icon: "🏠",
    color: "#a78bfa",
    references: ["Toronto Things To Do", "JAYDEN 제이든", "Net Kohen"],
    defaultProject: {
      name: "공간 투어",
      clips: [
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 4, subtitle: "", zoom: { scale: 1.1, panX: 0, panY: 0 } },
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 4, subtitle: "", speed: 0.9 },
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 4, subtitle: "" },
        { source: "", start: 0, end: 3, subtitle: "" },
      ],
      globalSubs: [
        { text: "오늘의 작업 공간", start: 0, end: 3, style: { size: 16, x: 50, y: 20, font: "'Apple SD Gothic Neo',sans-serif", bg: true, bgColor: "#000000", bgAlpha: 0.5, color: "#ffffff" } },
        { text: "코워킹 스페이스 둘러보기", start: 3, end: 7, style: { size: 14, x: 50, y: 85, font: "'Apple SD Gothic Neo',sans-serif", bg: true, bgColor: "#000000", bgAlpha: 0.5, color: "#ffffff" } },
        { text: "이 뷰 실화?", start: 12, end: 16, style: { size: 18, x: 50, y: 50, font: "'Apple SD Gothic Neo',sans-serif", bg: false, bgColor: "#000000", bgAlpha: 0, color: "#ffffff" } },
        { text: "📍 주소 or 장소명", start: 30, end: 34, style: { size: 12, x: 50, y: 90, font: "'Apple SD Gothic Neo',sans-serif", bg: true, bgColor: "#000000", bgAlpha: 0.6, color: "#ffffff" } },
      ],
      fps: 30,
    },
    referenceNote: "JAYDEN 45s (카페 작업, 19씬) / Net Kohen 38s (스타트업 오피스 8:30PM) / Toronto 14s (코워킹)",
  },

  // ─── 6. Talking Head + B-roll (45~90초) ───
  // 레퍼런스: Kyle (54s), Andrew (83s)
  // 패턴: 메인 토크 위주, 중간에 B-roll 삽입, 자막 필수 (큰 텍스트)
  {
    id: "talking-head",
    name: "토킹 헤드",
    description: "카메라 정면 토크가 메인. B-roll 삽입으로 지루함 방지. 자막이 핵심.",
    traits: ["정면 토크", "B-roll 삽입", "큰 자막", "정보/리뷰"],
    clipCount: "1 메인 + 3~5 B-roll",
    duration: "45~90초",
    editStyle: "메인 토크 10~20초 → B-roll 3~5초 → 토크 복귀, 반복",
    subtitleStyle: "큰 자막 하단, 키워드 하이라이트, 항상 표시",
    bgmStyle: "없거나 매우 작은 배경음",
    icon: "🗣️",
    color: "#ec4899",
    references: ["Kyle", "Andrew Skrypnyk"],
    defaultProject: {
      name: "토킹 헤드",
      clips: [
        { source: "", start: 0, end: 12, subtitle: "" },
        { source: "", start: 0, end: 4, subtitle: "", zoom: { scale: 1.15, panX: 0, panY: 0 } },
        { source: "", start: 0, end: 15, subtitle: "" },
        { source: "", start: 0, end: 4, subtitle: "", zoom: { scale: 1.1, panX: 0, panY: 0 } },
        { source: "", start: 0, end: 12, subtitle: "" },
        { source: "", start: 0, end: 3, subtitle: "" },
      ],
      globalSubs: [
        { text: "오늘 리뷰할 곳은...", start: 0, end: 4, style: { size: 18, x: 50, y: 82, font: "'Apple SD Gothic Neo',sans-serif", bg: true, bgColor: "#000000", bgAlpha: 0.6, color: "#ffffff" } },
        { text: "(핵심 내용 자막)", start: 5, end: 12, style: { size: 18, x: 50, y: 82, font: "'Apple SD Gothic Neo',sans-serif", bg: true, bgColor: "#000000", bgAlpha: 0.6, color: "#ffffff" } },
        { text: "(B-roll 구간)", start: 12, end: 16, style: { size: 14, x: 50, y: 85, font: "'Apple SD Gothic Neo',sans-serif", bg: true, bgColor: "#000000", bgAlpha: 0.4, color: "#ffffff" } },
        { text: "(결론/CTA)", start: 40, end: 47, style: { size: 20, x: 50, y: 82, font: "'Apple SD Gothic Neo',sans-serif", bg: true, bgColor: "#000000", bgAlpha: 0.6, color: "#ffffff" } },
      ],
      fps: 30,
    },
    referenceNote: "Kyle 54s (자유의지 에세이) / Andrew 83s (WeWork 리뷰, 씬체인지 적음) — 토크 중심 + B-roll",
  },

  // ─── 7. Startup Grind (11~15초) ───
  // 레퍼런스: Aryan (11s, 야근), DSlzvsCjlA9 (38s, 밤 오피스), Koen (6s, 팁)
  // 패턴: 작업하는 모습, 화면 클로즈업, 코드/화면, 야근/그라인드 분위기
  {
    id: "startup-grind",
    name: "스타트업 그라인드",
    description: "늦은 밤 코딩/작업 모습. 화면 클로즈업 + 작업 분위기 강조.",
    traits: ["야간 작업", "화면 클로즈업", "그라인드 무드", "코드/작업"],
    clipCount: "4~8개",
    duration: "11~20초",
    editStyle: "작업 화면 클로즈업 → 풀샷 → 디테일 → 결과물",
    subtitleStyle: "짧은 상태 자막 (시간, 작업 내용), 모노스페이스 느낌",
    bgmStyle: "Dark Lo-fi / Synthwave / Ambient",
    icon: "💻",
    color: "#14b8a6",
    references: ["Aryan Khurana", "Net Kohen", "Koen Salo"],
    defaultProject: {
      name: "스타트업 그라인드",
      clips: [
        { source: "", start: 0, end: 3, subtitle: "" },
        { source: "", start: 0, end: 3, subtitle: "", zoom: { scale: 1.3, panX: 0, panY: -10 } },
        { source: "", start: 0, end: 4, subtitle: "" },
        { source: "", start: 0, end: 3, subtitle: "", zoom: { scale: 1.2, panX: 5, panY: 0 } },
        { source: "", start: 0, end: 4, subtitle: "", speed: 0.85 },
      ],
      globalSubs: [
        { text: "PM 11:47", start: 0, end: 2.5, style: { size: 12, x: 15, y: 10, font: "Courier New,monospace", bg: false, bgColor: "#000000", bgAlpha: 0, color: "#4ade80" } },
        { text: "아직 퇴근 안 함", start: 3, end: 6, style: { size: 14, x: 50, y: 85, font: "'Apple SD Gothic Neo',sans-serif", bg: true, bgColor: "#000000", bgAlpha: 0.5, color: "#ffffff" } },
        { text: "9 to 5 끝나고\n진짜 일이 시작된다", start: 10, end: 14, style: { size: 16, x: 50, y: 45, font: "'Apple SD Gothic Neo',sans-serif", bg: false, bgColor: "#000000", bgAlpha: 0, color: "#ffffff" } },
      ],
      fps: 30,
    },
    referenceNote: "Aryan 11s (9-5 후 사이드 프로젝트) / Net Kohen 38s (월요일 밤 8:30 오피스) — 야간 그라인드",
  },

  // ─── 8. Aesthetic B-roll (10~20초) ───
  // 레퍼런스: C4zDOWtRvN_ (11s, sunset timelapse), 牛马 (19s, gaming nook)
  // 패턴: 슬로모션, 시네마틱, 무드 중심, 텍스트 최소
  {
    id: "aesthetic-broll",
    name: "감성 B-roll",
    description: "시네마틱 B-roll + 슬로모션 + 줌. 무드와 분위기가 핵심.",
    traits: ["슬로모션", "시네마틱", "줌인/아웃", "무드 중심"],
    clipCount: "4~8개",
    duration: "10~20초",
    editStyle: "슬로모션 0.6~0.8x, 줌인 1.1~1.3x, 자연광 강조",
    subtitleStyle: "최소한 (없거나 1~2 문장 감성 텍스트)",
    bgmStyle: "Cinematic / Ambient / Piano",
    icon: "✨",
    color: "#f97316",
    references: ["marisa", "牛马的home", "Dovydas Pinskus"],
    defaultProject: {
      name: "감성 B-roll",
      clips: [
        { source: "", start: 0, end: 4, subtitle: "", speed: 0.7, zoom: { scale: 1.15, panX: 0, panY: -3 } },
        { source: "", start: 0, end: 3, subtitle: "", speed: 0.6 },
        { source: "", start: 0, end: 4, subtitle: "", speed: 0.75, zoom: { scale: 1.2, panX: 3, panY: 0 } },
        { source: "", start: 0, end: 3, subtitle: "", speed: 0.65 },
        { source: "", start: 0, end: 4, subtitle: "", speed: 0.7, zoom: { scale: 1.1, panX: -2, panY: -2 } },
      ],
      globalSubs: [
        { text: "순간을 담다", start: 6, end: 10, style: { size: 18, x: 50, y: 50, font: "'고운바탕',serif", bg: false, bgColor: "#000000", bgAlpha: 0, color: "#ffffff" } },
      ],
      fps: 30,
    },
    referenceNote: "marisa 11s (sunset work) / 牛马 19s (리버사이드 공간) / Dovydas 16s (반복의 미학) — 무드 중심",
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
      project.clips = project.clips.map((clip, i) => ({
        ...clip,
        source: selectedVideos[i % selectedVideos.length],
      }));
    }

    localStorage.setItem("brxce-video-preset", JSON.stringify(project));
    setSelectedPreset(null);
    router.push("/studio/video-edit");
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="px-12 pt-10 pb-8 border-b border-white/[0.06]">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-black text-[#fafafa]">영상 편집 프리셋</h1>
            <p className="text-sm text-white/40 mt-2 leading-relaxed">
              인스타그램 릴스 레퍼런스 20개 분석 기반 · 프리셋 선택 → 소스 교체 → 편집 · 1080×1920
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => openSourcePicker(preset)}
              className="group border border-[#1a1a1a] rounded-2xl bg-[#0c0c0c] hover:bg-[#111] hover:border-[#333] transition-all overflow-hidden cursor-pointer"
            >
              <div className="p-5">
                {/* Top row */}
                <div className="flex items-start gap-3 mb-3">
                  <PresetIcon icon={preset.icon} color={preset.color} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#fafafa] mb-0.5">{preset.name}</h3>
                    <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2">{preset.description}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: preset.color + "20" }}>
                      <Play className="w-3.5 h-3.5 ml-0.5" style={{ color: preset.color }} />
                    </div>
                  </div>
                </div>

                {/* Traits */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {preset.traits.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                      style={{ backgroundColor: preset.color + "10", color: preset.color }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <MetaItem icon={<Film className="w-3 h-3" />} label="클립" value={preset.clipCount} />
                  <MetaItem icon={<Clock className="w-3 h-3" />} label="길이" value={preset.duration} />
                  <MetaItem icon={<Type className="w-3 h-3" />} label="자막" value={preset.subtitleStyle} />
                  <MetaItem icon={<Music className="w-3 h-3" />} label="BGM" value={preset.bgmStyle} />
                </div>

                {/* Edit style */}
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <Zap className="w-3 h-3 text-white/25 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-white/35 leading-relaxed">{preset.editStyle}</p>
                </div>
              </div>

              {/* Footer: references */}
              <div className="px-5 py-2.5 border-t border-white/[0.04] bg-white/[0.015] flex items-center gap-2">
                <Eye className="w-3 h-3 text-white/15 shrink-0" />
                <p className="text-[9px] text-white/25 truncate">
                  레퍼런스: {preset.references.join(", ")}
                </p>
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
            className="bg-[#111] rounded-2xl w-[680px] max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 mb-2">
                <PresetIcon icon={selectedPreset.icon} color={selectedPreset.color} />
                <div>
                  <h3 className="text-lg font-bold text-[#fafafa]">{selectedPreset.name}</h3>
                  <p className="text-xs text-white/40">{selectedPreset.description}</p>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <p className="text-[10px] text-white/30 mb-1">📎 레퍼런스 분석</p>
                <p className="text-xs text-white/50">{selectedPreset.referenceNote}</p>
              </div>
              <p className="text-sm text-white/50 mt-3">
                소스 영상을 선택하세요. 선택한 영상이 프리셋의 {selectedPreset.defaultProject.clips.length}개 클립에 배분됩니다.
              </p>
              <p className="text-xs text-white/30 mt-1">
                추천 클립 수: {selectedPreset.clipCount} · 선택됨: {selectedVideos.length}개
              </p>
            </div>

            {/* Add external */}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <GuideCard step="1" icon="🔍" title="레퍼런스 분석" desc="레퍼런스 영상의 편집 패턴(클립 길이, 전환, 자막)을 분석해서 프리셋을 만들었습니다." />
          <GuideCard step="2" icon="🎯" title="프리셋 선택" desc="콘텐츠 유형에 맞는 프리셋 선택. 클립 수/길이/자막 구조가 자동 세팅됩니다." />
          <GuideCard step="3" icon="📹" title="소스 교체 & 편집" desc="영상 편집기에서 소스를 교체하고 자막을 수정. 타이밍은 프리셋이 잡아줍니다." />
          <GuideCard step="4" icon="🚀" title="렌더링 & 업로드" desc="편집 완료 → 렌더링 → MP4 다운로드 → 인스타/유튜브 업로드." />
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="text-white/20 mt-0.5">{icon}</span>
      <div>
        <p className="text-[8px] text-white/20 uppercase tracking-wider">{label}</p>
        <p className="text-[10px] text-white/45 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function GuideCard({ step, icon, title, desc }: { step: string; icon: string; title: string; desc: string }) {
  return (
    <div className="p-4 rounded-xl bg-[#0c0c0c] border border-[#1a1a1a]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-[10px] text-white/20 font-mono">STEP {step}</span>
      </div>
      <h3 className="text-sm font-semibold text-white/80 mb-1.5">{title}</h3>
      <p className="text-[11px] text-white/35 leading-relaxed">{desc}</p>
    </div>
  );
}
