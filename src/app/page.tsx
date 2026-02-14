"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import SubscribeForm from "@/components/SubscribeForm";
import Link from "next/link";

/** Handle OAuth code on main page redirect */
function useHandleOAuthCode() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      // Exchange code via callback route, then clean URL
      fetch(`/auth/callback?code=${code}`).finally(() => {
        router.replace("/");
      });
    }
  }, [searchParams, router]);
}

function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const sb = createSupabaseBrowser();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      sb.from("profiles").select("role").eq("id", user.id).single().then(({ data }) => {
        if (data?.role === "admin") setIsAdmin(true);
      });
    });
  }, []);
  return isAdmin;
}

/* ── Social SVG Icons ── */
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const ThreadsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.083.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.343-.783-.98-1.404-1.812-1.837-.07.93-.243 1.808-.534 2.573-.509 1.33-1.318 2.316-2.399 2.928-1.085.614-2.365.79-3.472.478-1.269-.358-2.281-1.319-2.692-2.554-.37-1.112-.294-2.384.203-3.382.483-.969 1.306-1.674 2.399-2.074.905-.332 1.972-.472 3.18-.42.553.024 1.088.08 1.603.168-.087-.672-.304-1.248-.67-1.68-.534-.631-1.39-.962-2.543-.984h-.025c-.876 0-1.97.266-2.574 1.145l-1.718-1.143C8.11 5.593 9.603 4.958 11.36 4.944h.04c1.726.018 3.1.604 3.983 1.646.793.937 1.218 2.2 1.272 3.76.484.158.94.353 1.365.586 1.257.689 2.192 1.696 2.7 2.913.772 1.848.85 4.538-1.247 6.592-1.768 1.731-3.951 2.512-7.065 2.534l-.222.025zM10.5 15.86c.137.412.425.73.838.876.585.165 1.287.078 1.887-.248.66-.358 1.178-1.04 1.545-2.03.162-.437.283-.933.356-1.474-.66-.148-1.35-.222-2.053-.222h-.094c-1.543.064-2.862.592-2.479 3.098z" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);
const ClaudeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[16px] h-[16px]">
    <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
  </svg>
);

/* ── Modal Component ── */
function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#141414] border border-[#333] rounded-2xl p-8 max-w-[380px] w-full text-center">
        {children}
      </div>
    </div>
  );
}

/* ── Main Page ── */
/* ── Latest Guides Hook ── */
function useLatestGuides() {
  const [guides, setGuides] = useState<Array<{id: string; title: string; slug: string; hook?: string; summary?: string; created_at: string}>>([]);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    setLoaded(true);
    const sb = createSupabaseBrowser();
    sb.from("contents")
      .select("id, title, slug, hook, summary, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data) setGuides(data);
      });
  }

  return guides;
}

function OAuthHandler() {
  useHandleOAuthCode();
  return null;
}

export default function Home() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistProduct, setWaitlistProduct] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryDone, setInquiryDone] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const latestGuides = useLatestGuides();
  const isAdmin = useIsAdmin();
  const router = useRouter();

  const waitlistDescs: Record<string, string> = {
    "오픈클로 가이드북":
      "OpenClaw × ClaudeCode로 AI 에이전트를 직접 세팅하는 실전 가이드.\n\n✓ 첫 에이전트 30분 만에 돌리기\n✓ 실제 업무 자동화 워크플로우 3가지\n✓ 삽질 줄이는 설정 팁 & 트러블슈팅\n\n이메일을 남겨주시면 오픈 즉시 보내드립니다.",
    "오픈클로 실전 활용법":
      "14개 AI 에이전트로 회사를 운영하는 실제 워크플로우를 공개합니다.\n\n✓ 에이전트 역할 분담 설계법\n✓ 실제 비용 & ROI 분석\n✓ 흔한 실패 패턴과 해결법\n\n이메일을 남겨주시면 오픈 즉시 보내드립니다.",
  };

  async function submitForm(type: "waitlist" | "inquiry") {
    if (!email || !email.includes("@")) return;
    setSubmitting(true);
    try {
      const sb = createSupabaseBrowser();
      await sb.from("submissions").insert({
        email,
        type,
        product: type === "waitlist" ? waitlistProduct : null,
      });
    } catch {}
    setSubmitting(false);
    setEmail("");
    if (type === "waitlist") setWaitlistDone(true);
    else setInquiryDone(true);
  }

  return (
    <div className="min-h-screen flex justify-center px-5 py-15">
      <Suspense fallback={null}><OAuthHandler /></Suspense>
      <div className="max-w-[420px] w-full flex flex-col items-center">
        {/* Profile */}
        <div className="w-24 h-24 rounded-full border-2 border-[#333] mb-4 overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
          <Image src="/profile.jpg" alt="Bruce Choe" width={96} height={96} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-[22px] font-bold mb-1">Bruce Choe</h1>
        <p className="text-sm text-[#888] mb-5">@brxce.ai</p>

        {/* Social Icons */}
        <div className="flex items-center gap-4 mb-5">
          {[
            { href: "https://www.instagram.com/brxce.ai/", icon: <InstagramIcon />, label: "Instagram" },
            { href: "https://www.threads.com/@brxce.ai", icon: <ThreadsIcon />, label: "Threads" },
            { href: "https://x.com/brxce_ai", icon: <XIcon />, label: "X" },
            { href: "https://www.linkedin.com/in/brxce", icon: <LinkedInIcon />, label: "LinkedIn" },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener"
              aria-label={s.label}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] hover:text-[#fafafa] hover:border-[#444] transition-all hover:-translate-y-0.5"
            >
              {s.icon}
            </a>
          ))}
        </div>

        {/* Powered by */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-[#222] text-[12px] text-[#666]">
            <span>Powered by</span>
            <a href="https://openclaw.ai" target="_blank" rel="noopener" className="hover:opacity-80 transition-opacity">
              <Image src="/openclaw-logo.svg" alt="OpenClaw" width={16} height={16} className="rounded" />
            </a>
            <span>×</span>
            <a href="https://claude.ai" target="_blank" rel="noopener" className="hover:opacity-80 transition-opacity text-[#D97757]">
              <ClaudeIcon />
            </a>
          </div>
        </div>

        {/* Bio */}
        <div className="text-center text-sm leading-[1.7] text-[#ccc] mb-6">
          <span className="text-[#fafafa] font-medium">✦ 에이전틱 워크플로우</span>
          <br />
          ✦ OpenClaw × ClaudeCode로 회사를 굴리는 개발자 CEO
          <br />
          ✦ 수십 개의 AI 에이전트를 직접 빌딩하며 얻은 실전 인사이트
          <br />✦ 직접 활용해 본 결과를 공유합니다.
        </div>

        {/* Discord CTA */}
        <a
          href="https://discord.gg/fptPWQpdwD"
          target="_blank"
          rel="noopener"
          className="flex items-center justify-center gap-2.5 w-full py-3.5 px-5 rounded-xl bg-[#5865F2] text-white text-[15px] font-semibold hover:bg-[#4752C4] hover:-translate-y-0.5 transition-all mb-6"
        >
          <DiscordIcon />
          디스코드 커뮤니티 참여하기
        </a>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-7">
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

        {/* Links */}
        <div className="w-full flex flex-col gap-3">
          {/* Section: 에이전틱 워크플로우 */}
          <div className="flex items-center gap-3 mt-8 mb-1 text-[13px] font-semibold text-[#888] tracking-wide">
            <span className="flex-1 h-px bg-[#333]" />
            에이전틱 워크플로우
            <span className="flex-1 h-px bg-[#333]" />
          </div>

          <button
            onClick={() => {
              if (isAdmin) { router.push("/guides?preview=brxce-preview-2026"); return; }
              setWaitlistProduct("오픈클로 가이드북");
              setWaitlistDone(false);
              setEmail("");
              setWaitlistOpen(true);
            }}
            className="flex items-center justify-center gap-2.5 w-full py-4 px-5 rounded-xl bg-[#141414] border border-[#222] text-[#fafafa] text-[15px] font-medium hover:bg-[#1a1a1a] hover:border-[#444] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Image src="/openclaw-logo.svg" alt="" width={22} height={22} className="rounded" />
            오픈클로 가이드북
          </button>

          <button
            onClick={() => {
              if (isAdmin) { router.push("/practical"); return; }
              setWaitlistProduct("오픈클로 실전 활용법");
              setWaitlistDone(false);
              setEmail("");
              setWaitlistOpen(true);
            }}
            className="flex items-center justify-center gap-2.5 w-full py-4 px-5 rounded-xl bg-[#141414] border border-[#222] text-[#fafafa] text-[15px] font-medium hover:bg-[#1a1a1a] hover:border-[#444] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Image src="/openclaw-logo.svg" alt="" width={22} height={22} className="rounded" />
            오픈클로 실전 활용법
          </button>

          <button
            onClick={() => {
              setInquiryDone(false);
              setEmail("");
              setInquiryOpen(true);
            }}
            className="flex items-center justify-center gap-2.5 w-full py-4 px-5 rounded-xl bg-[#fafafa] border border-[#fafafa] text-[#0a0a0a] text-[15px] font-semibold hover:bg-[#e0e0e0] hover:border-[#e0e0e0] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <span>✉️</span>
            에이전틱 워크플로우 도입 문의
          </button>

          {/* Section: 서비스 */}
          <div className="flex items-center gap-3 mt-8 mb-1 text-[13px] font-semibold text-[#888] tracking-wide">
            <span className="flex-1 h-px bg-[#333]" />
            서비스
            <span className="flex-1 h-px bg-[#333]" />
          </div>

          <a
            href="https://www.brxce.com"
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2.5 w-full py-4 px-5 rounded-xl bg-[#141414] border border-[#222] text-[#fafafa] text-[15px] font-medium hover:bg-[#1a1a1a] hover:border-[#444] hover:-translate-y-0.5 transition-all no-underline"
          >
            <span>🚀</span>
            BRXCE — 프로젝트 관리
          </a>

          {/* Section: SI */}
          <div className="flex items-center gap-3 mt-8 mb-1 text-[13px] font-semibold text-[#888] tracking-wide">
            <span className="flex-1 h-px bg-[#333]" />
            SI · 개발 외주
            <span className="flex-1 h-px bg-[#333]" />
          </div>

          <a
            href="https://intellieffect.com"
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2.5 w-full py-4 px-5 rounded-xl bg-[#141414] border border-[#222] text-[#fafafa] text-[15px] font-medium hover:bg-[#1a1a1a] hover:border-[#444] hover:-translate-y-0.5 transition-all no-underline"
          >
            <span>⚡</span>
            인텔리이펙트
          </a>
        </div>

        {/* Latest Guides */}
        {latestGuides.length > 0 && (
          <div className="w-full mt-10">
            <div className="flex items-center gap-3 mb-4 text-[13px] font-semibold text-[#888] tracking-wide">
              <span className="flex-1 h-px bg-[#333]" />
              최신 가이드
              <span className="flex-1 h-px bg-[#333]" />
            </div>
            <div className="flex flex-col gap-3">
              {latestGuides.map((g) => (
                <Link
                  key={g.id}
                  href={`/guides/${g.slug || g.id}`}
                  className="block p-4 bg-[#111] border border-[#1a1a1a] rounded-xl no-underline text-[#ccc] hover:border-[#333] hover:text-[#fafafa] transition-all"
                >
                  <div className="text-[15px] font-medium">{g.title}</div>
                  {(g.summary || g.hook) && (
                    <div className="text-[13px] text-[#888] mt-1 line-clamp-1">{g.summary || g.hook}</div>
                  )}
                  <div className="text-[11px] text-[#555] mt-2">
                    {new Date(g.created_at).toLocaleDateString("ko-KR")}
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/guides"
              className="block mt-3 text-center text-[13px] text-[#888] no-underline hover:text-[#fafafa] transition-colors"
            >
              더 보기 →
            </Link>
          </div>
        )}

        {/* Newsletter Subscribe */}
        <div className="w-full mt-10">
          <div className="flex items-center gap-3 mb-4 text-[13px] font-semibold text-[#888] tracking-wide">
            <span className="flex-1 h-px bg-[#333]" />
            뉴스레터
            <span className="flex-1 h-px bg-[#333]" />
          </div>
          <p className="text-sm text-[#888] text-center mb-3">
            AI 에이전트 활용 인사이트를 이메일로 받아보세요.
          </p>
          <SubscribeForm />
        </div>

        {/* Footer */}
        <div className="mt-10 text-xs text-[#555] text-center">
          © 2026 Bruce Choe · bruce@brxce.ai
        </div>
      </div>

      {/* Waitlist Modal */}
      <Modal open={waitlistOpen} onClose={() => setWaitlistOpen(false)}>
        {!waitlistDone ? (
          <>
            <div className="text-4xl mb-3">🦞</div>
            <h2 className="text-lg font-bold mb-2">{waitlistProduct} — 오픈 예정</h2>
            <p className="text-sm text-[#999] leading-relaxed mb-6 whitespace-pre-line">
              {waitlistDescs[waitlistProduct] || "곧 공개됩니다."}
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitForm("waitlist")}
              placeholder="이메일 주소를 입력하세요"
              className="w-full p-3.5 rounded-[10px] border border-[#333] bg-[#0a0a0a] text-[#fafafa] text-sm outline-none focus:border-[#555] mb-3"
            />
            <button
              onClick={() => submitForm("waitlist")}
              disabled={submitting}
              className="w-full p-3.5 rounded-[10px] bg-[#fafafa] text-[#0a0a0a] text-[15px] font-semibold cursor-pointer hover:bg-[#e0e0e0] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "등록 중..." : "대기 등록"}
            </button>
            <button onClick={() => setWaitlistOpen(false)} className="mt-4 text-[13px] text-[#666] hover:text-[#999] bg-transparent border-none cursor-pointer">
              닫기
            </button>
          </>
        ) : (
          <>
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-lg font-bold mb-2">등록 완료!</h2>
            <p className="text-sm text-[#999] leading-relaxed mb-4">
              오픈 시 가장 먼저 알려드리겠습니다.
              <br />
              감사합니다 🦞
            </p>
            <button onClick={() => setWaitlistOpen(false)} className="mt-2 text-[13px] text-[#666] hover:text-[#999] bg-transparent border-none cursor-pointer">
              닫기
            </button>
          </>
        )}
      </Modal>

      {/* Inquiry Modal */}
      <Modal open={inquiryOpen} onClose={() => setInquiryOpen(false)}>
        {!inquiryDone ? (
          <>
            <div className="text-4xl mb-3">✉️</div>
            <h2 className="text-lg font-bold mb-2">에이전틱 워크플로우 도입 문의</h2>
            <p className="text-sm text-[#999] leading-relaxed mb-6">
              현재 업무 프로세스를 듣고,
              <br />
              OpenClaw × ClaudeCode를 활용한
              <br />
              에이전틱 워크플로우 적용 가능 여부를
              <br />
              진단해드립니다.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitForm("inquiry")}
              placeholder="이메일 주소를 입력하세요"
              className="w-full p-3.5 rounded-[10px] border border-[#333] bg-[#0a0a0a] text-[#fafafa] text-sm outline-none focus:border-[#555] mb-3"
            />
            <button
              onClick={() => submitForm("inquiry")}
              disabled={submitting}
              className="w-full p-3.5 rounded-[10px] bg-[#fafafa] text-[#0a0a0a] text-[15px] font-semibold cursor-pointer hover:bg-[#e0e0e0] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "접수 중..." : "문의하기"}
            </button>
            <button onClick={() => setInquiryOpen(false)} className="mt-4 text-[13px] text-[#666] hover:text-[#999] bg-transparent border-none cursor-pointer">
              닫기
            </button>
          </>
        ) : (
          <>
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-lg font-bold mb-2">문의 접수 완료!</h2>
            <p className="text-sm text-[#999] leading-relaxed mb-4">
              24시간 내에 연락드리겠습니다.
              <br />
              감사합니다 🦞
            </p>
            <button onClick={() => setInquiryOpen(false)} className="mt-2 text-[13px] text-[#666] hover:text-[#999] bg-transparent border-none cursor-pointer">
              닫기
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}
