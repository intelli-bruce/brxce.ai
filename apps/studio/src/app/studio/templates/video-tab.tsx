"use client";

import { VIDEO_TEMPLATES, type VideoTemplateInfo } from "@/lib/studio/video-templates";
import { Film, Clock, Monitor, Layers, ChevronRight, Play, Tag } from "lucide-react";

function SourceBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    video: "bg-blue-500/15 text-blue-400",
    image: "bg-green-500/15 text-green-400",
    text: "bg-yellow-500/15 text-yellow-400",
    audio: "bg-purple-500/15 text-purple-400",
    srt: "bg-pink-500/15 text-pink-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${colors[type] || "bg-white/10 text-white/50"}`}>
      {type.toUpperCase()}
    </span>
  );
}

function VideoTemplateCard({ template }: { template: VideoTemplateInfo }) {
  return (
    <div className="group border border-[#1a1a1a] rounded-2xl bg-[#0c0c0c] hover:bg-[#111] hover:border-[#2a2a2a] transition-all overflow-hidden">
      {/* Preview area — mockup */}
      <div className="relative aspect-[9/16] max-h-[320px] bg-gradient-to-br from-[#0a0a0a] to-[#141414] flex flex-col items-center justify-center overflow-hidden">
        {/* Phone frame mockup */}
        <div className="w-[140px] h-[250px] rounded-[20px] border-2 border-[#222] bg-[#0a0a0a] overflow-hidden relative flex flex-col">
          {/* Status bar */}
          <div className="h-4 bg-[#111] flex items-center justify-center">
            <div className="w-12 h-1.5 rounded-full bg-[#222]" />
          </div>
          {/* Content area */}
          <div className="flex-1 flex flex-col items-center justify-center p-3 gap-2">
            <Film className="w-8 h-8 text-[#ff6b35]/40" />
            <span className="text-[8px] text-white/30 font-medium text-center leading-tight">
              {template.tagline}
            </span>
          </div>
          {/* Bottom bar */}
          <div className="h-4 bg-[#111] flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
            <div className="w-6 h-1 rounded-full bg-[#333]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
          </div>
        </div>
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-[#ff6b35]/20 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-5 h-5 text-[#ff6b35] ml-0.5" />
          </div>
        </div>
        {/* Resolution badge */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/50 text-[10px] text-white/40 font-mono">
          {template.width}×{template.height}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-bold text-[#fafafa]">{template.description}</h3>
        </div>
        <p className="text-xs text-white/40 leading-relaxed mb-4 line-clamp-2">
          {template.useCase}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-[11px] text-white/30 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ~{template.defaultDuration}초
          </span>
          <span className="flex items-center gap-1">
            <Monitor className="w-3 h-3" />
            {template.fps}fps
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {template.propsGuide.length} props
          </span>
        </div>

        {/* Required sources */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {template.requiredSources.map((src) => (
            <SourceBadge key={src} type={src} />
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {template.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-white/30">
              #{tag}
            </span>
          ))}
        </div>

        {/* Examples */}
        <div className="border-t border-white/[0.06] pt-3 mt-1">
          <p className="text-[10px] text-white/25 font-semibold mb-2 uppercase tracking-wider">예시 시나리오</p>
          <ul className="space-y-1">
            {template.examples.map((ex, i) => (
              <li key={i} className="text-[11px] text-white/35 flex items-start gap-1.5">
                <span className="text-[#ff6b35]/50 mt-0.5">•</span>
                {ex}
              </li>
            ))}
          </ul>
        </div>

        {/* Props guide expandable */}
        <details className="mt-3 border-t border-white/[0.06] pt-3">
          <summary className="text-[10px] text-white/25 font-semibold uppercase tracking-wider cursor-pointer hover:text-white/40 transition flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            주요 Props ({template.propsGuide.length}개)
          </summary>
          <div className="mt-2 space-y-1.5">
            {template.propsGuide.map((p) => (
              <div key={p.key} className="text-[11px]">
                <span className="font-mono text-[#ff6b35]/60">{p.key}</span>
                <span className="text-white/20 mx-1.5">—</span>
                <span className="text-white/35">{p.desc}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

export default function VideoTab() {
  return (
    <div className="pb-20">
      {/* Header */}
      <div className="px-12 pt-10 pb-8 border-b border-white/[0.06]">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-black text-[#fafafa]">영상 템플릿</h1>
            <p className="text-sm text-white/40 mt-2 leading-relaxed">
              Remotion 기반 영상 컴포지션 · 쇼츠/릴스용 1080×1920
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/25">{VIDEO_TEMPLATES.length}개 템플릿</span>
            <button
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#ff6b35] text-white hover:bg-[#ff5522] transition"
              disabled
              title="프로젝트 생성 기능 준비 중"
            >
              + 새 프로젝트
            </button>
          </div>
        </div>
      </div>

      {/* Template grid */}
      <div className="px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VIDEO_TEMPLATES.map((tpl) => (
            <VideoTemplateCard key={tpl.id} template={tpl} />
          ))}
        </div>
      </div>

      {/* Guide section */}
      <div className="px-12 py-8 border-t border-white/[0.06]">
        <h2 className="text-lg font-bold text-[#fafafa] mb-4">사용 가이드</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-[#0c0c0c] border border-[#1a1a1a]">
            <div className="text-lg mb-2">📹</div>
            <h3 className="text-sm font-semibold text-white/80 mb-2">1. 소스 준비</h3>
            <p className="text-xs text-white/35 leading-relaxed">
              스크린 녹화, 타임랩스 클립, 배경 영상 등을 미디어 라이브러리에 업로드하세요.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[#0c0c0c] border border-[#1a1a1a]">
            <div className="text-lg mb-2">🎬</div>
            <h3 className="text-sm font-semibold text-white/80 mb-2">2. 템플릿 선택</h3>
            <p className="text-xs text-white/35 leading-relaxed">
              콘텐츠 유형에 맞는 템플릿을 선택하고 Props를 설정합니다. 프리뷰로 확인 후 렌더링.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[#0c0c0c] border border-[#1a1a1a]">
            <div className="text-lg mb-2">🚀</div>
            <h3 className="text-sm font-semibold text-white/80 mb-2">3. 렌더 & 배포</h3>
            <p className="text-xs text-white/35 leading-relaxed">
              Remotion으로 렌더링 → MP4 출력 → 유튜브 쇼츠/인스타 릴스에 바로 업로드.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
