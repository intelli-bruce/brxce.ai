"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ClaudeIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: size, height: size }}>
    <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
  </svg>
);

export default function ShowcasePage() {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      router.replace("/");
    }
  }, [router]);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa] px-5 py-10">
      <div className="max-w-[600px] mx-auto">
        <h1 className="text-2xl font-bold mb-2">🦞 Showcase</h1>
        <p className="text-sm text-[#888] mb-10">Powered by 섹션 — 버전 비교 (dev only)</p>

        {/* ── Version A: 현재 (심플 인라인) ── */}
        <Section label="A — 심플 인라인 (현재)">
          <div className="flex items-center justify-center gap-2 text-[13px] text-[#555]">
            <span>Powered by</span>
            <a href="#" className="hover:opacity-80 transition-opacity">
              <Image src="/openclaw-logo.svg" alt="OpenClaw" width={20} height={20} className="rounded" />
            </a>
            <span>×</span>
            <a href="#" className="hover:opacity-80 transition-opacity text-[#D97757]">
              <ClaudeIcon size={20} />
            </a>
          </div>
        </Section>

        {/* ── Version B: 이름 포함 ── */}
        <Section label="B — 로고 + 이름">
          <div className="flex items-center justify-center gap-2.5 text-[13px] text-[#555]">
            <span>Powered by</span>
            <a href="#" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <Image src="/openclaw-logo.svg" alt="OpenClaw" width={18} height={18} className="rounded" />
              <span className="text-[#999]">OpenClaw</span>
            </a>
            <span>×</span>
            <a href="#" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <span className="text-[#D97757]"><ClaudeIcon size={18} /></span>
              <span className="text-[#999]">Claude</span>
            </a>
          </div>
        </Section>

        {/* ── Version C: 구분선 통합 ── */}
        <Section label="C — 섹션 구분선 안에 통합">
          <div className="flex items-center gap-3 text-[13px] text-[#555]">
            <span className="flex-1 h-px bg-[#333]" />
            <span>Powered by</span>
            <a href="#" className="hover:opacity-80 transition-opacity">
              <Image src="/openclaw-logo.svg" alt="OpenClaw" width={16} height={16} className="rounded" />
            </a>
            <span>×</span>
            <a href="#" className="hover:opacity-80 transition-opacity text-[#D97757]">
              <ClaudeIcon size={16} />
            </a>
            <span className="flex-1 h-px bg-[#333]" />
          </div>
        </Section>

        {/* ── Version D: 칩/뱃지 스타일 ── */}
        <Section label="D — 뱃지 스타일">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-[#222] text-[12px] text-[#666]">
              <span>Powered by</span>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image src="/openclaw-logo.svg" alt="OpenClaw" width={16} height={16} className="rounded" />
              </a>
              <span>×</span>
              <a href="#" className="hover:opacity-80 transition-opacity text-[#D97757]">
                <ClaudeIcon size={16} />
              </a>
            </div>
          </div>
        </Section>

        {/* ── Version E: 뱃지 + 이름 ── */}
        <Section label="E — 뱃지 + 이름">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-[#222] text-[12px] text-[#666]">
              <span>Powered by</span>
              <a href="#" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                <Image src="/openclaw-logo.svg" alt="OpenClaw" width={14} height={14} className="rounded" />
                <span className="text-[#999]">OpenClaw</span>
              </a>
              <span>×</span>
              <a href="#" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                <span className="text-[#D97757]"><ClaudeIcon size={14} /></span>
                <span className="text-[#999]">Claude</span>
              </a>
            </div>
          </div>
        </Section>

        {/* ── Version F: 미니멀 (텍스트 only) ── */}
        <Section label="F — 텍스트 온리">
          <div className="text-center text-[12px] text-[#444]">
            Powered by <span className="text-[#999]">OpenClaw</span> × <span className="text-[#D97757]">Claude</span>
          </div>
        </Section>

        {/* ── 배치 비교 ── */}
        <div className="mt-16 border-t border-[#222] pt-10">
          <h2 className="text-lg font-bold mb-2">📍 배치 비교 (D 뱃지 스타일)</h2>
          <p className="text-sm text-[#888] mb-10">같은 D 스타일을 다른 위치에 배치했을 때</p>

          {/* ── Position 1: SNS 아이콘 바로 아래 (바이오 위) ── */}
          <ContextSection label="위치 1 — SNS 아이콘 아래, 바이오 위">
            <SnsIcons />
            <div className="flex justify-center my-4">
              <BadgeD />
            </div>
            <Bio />
            <Stats />
            <SectionDivider />
            <Buttons />
          </ContextSection>

          {/* ── Position 2: 바이오 아래, Stats 위 ── */}
          <ContextSection label="위치 2 — 바이오 아래, Stats 위">
            <SnsIcons />
            <Bio />
            <div className="flex justify-center my-4">
              <BadgeD />
            </div>
            <Stats />
            <SectionDivider />
            <Buttons />
          </ContextSection>

          {/* ── Position 3: Stats 아래, 섹션 구분선 위 (현재) ── */}
          <ContextSection label="위치 3 — Stats 아래, 섹션 구분선 위 (현재)">
            <SnsIcons />
            <Bio />
            <Stats />
            <div className="flex justify-center my-4">
              <BadgeD />
            </div>
            <SectionDivider />
            <Buttons />
          </ContextSection>

          {/* ── Position 4: 페이지 맨 아래 (푸터 위) ── */}
          <ContextSection label="위치 4 — 페이지 맨 아래 (푸터 위)">
            <SnsIcons />
            <Bio />
            <Stats />
            <SectionDivider />
            <Buttons />
            <div className="flex justify-center mt-8 mb-2">
              <BadgeD />
            </div>
            <div className="text-xs text-[#555] text-center mt-4">© 2026 Bruce Choe · bruce@brxce.ai</div>
          </ContextSection>

          {/* ── Position 5: 섹션 구분선 대체 ── */}
          <ContextSection label="위치 5 — 섹션 구분선을 대체">
            <SnsIcons />
            <Bio />
            <Stats />
            <div className="flex items-center gap-3 mt-8 mb-3">
              <span className="flex-1 h-px bg-[#333]" />
              <BadgeD />
              <span className="flex-1 h-px bg-[#333]" />
            </div>
            <Buttons />
          </ContextSection>
        </div>

      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="text-[11px] text-[#666] font-mono mb-3 px-1">{label}</div>
      <div className="border border-[#222] rounded-xl bg-[#0d0d0d] p-8">
        {children}
      </div>
    </div>
  );
}

function ContextSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-14">
      <div className="text-[12px] text-[#666] font-mono mb-4 px-1">{label}</div>
      <div className="max-w-[420px] mx-auto border border-[#222] rounded-2xl bg-[#0a0a0a] p-8">
        {children}
      </div>
    </div>
  );
}

function BadgeD() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-[#222] text-[12px] text-[#666]">
      <span>Powered by</span>
      <Image src="/openclaw-logo.svg" alt="OpenClaw" width={16} height={16} className="rounded" />
      <span>×</span>
      <span className="text-[#D97757]"><ClaudeIcon size={16} /></span>
    </div>
  );
}

function SnsIcons() {
  return (
    <div className="flex items-center justify-center gap-4 mb-5">
      {["Instagram", "Threads", "X", "LinkedIn"].map((name) => (
        <div key={name} className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[10px] text-[#555]">
          {name[0]}
        </div>
      ))}
    </div>
  );
}

function Bio() {
  return (
    <div className="text-center text-sm leading-[1.7] text-[#ccc] mb-6">
      <span className="text-[#fafafa] font-medium">✦ 에이전틱 워크플로우</span>
      <br />✦ OpenClaw × ClaudeCode로 회사를 굴리는 개발자 CEO
      <br />✦ 수십 개의 AI 에이전트를 직접 빌딩하며 얻은 실전 인사이트
      <br />✦ 직접 활용해 본 결과를 공유합니다.
    </div>
  );
}

function Stats() {
  return (
    <div className="flex justify-center gap-6 mb-5">
      {[
        { num: "50+", label: "AI 프로젝트" },
        { num: "38", label: "클라이언트" },
        { num: "3", label: "자체 AI 서비스" },
      ].map((s) => (
        <div key={s.label} className="text-center">
          <div className="text-xl font-bold">{s.num}</div>
          <div className="text-[11px] text-[#888] mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-3 mt-6 mb-3 text-[13px] font-semibold text-[#888] tracking-wide">
      <span className="flex-1 h-px bg-[#333]" />
      에이전틱 워크플로우
      <span className="flex-1 h-px bg-[#333]" />
    </div>
  );
}

function Buttons() {
  return (
    <div className="flex flex-col gap-3 mt-3">
      <div className="flex items-center justify-center gap-2.5 w-full py-4 px-5 rounded-xl bg-[#141414] border border-[#222] text-[#fafafa] text-[15px] font-medium">
        <Image src="/openclaw-logo.svg" alt="" width={22} height={22} className="rounded" />
        오픈클로 가이드북
      </div>
      <div className="flex items-center justify-center gap-2.5 w-full py-4 px-5 rounded-xl bg-[#141414] border border-[#222] text-[#fafafa] text-[15px] font-medium">
        <Image src="/openclaw-logo.svg" alt="" width={22} height={22} className="rounded" />
        오픈클로 실전 활용법
      </div>
    </div>
  );
}
