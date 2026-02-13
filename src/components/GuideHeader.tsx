import Image from "next/image";
import Link from "next/link";

export default function GuideHeader() {
  return (
    <header className="border-b border-[#1a1a1a] px-5 py-4 flex items-center justify-between sticky top-0 z-50" style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)" }}>
      <Link href="/" className="flex items-center gap-2.5 no-underline text-[#fafafa]">
        <Image src="/profile.jpg" alt="Bruce Choe" width={28} height={28} className="rounded-full" />
        <span className="text-sm font-semibold">brxce.ai</span>
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/guides" className="text-[13px] text-[#888] no-underline hover:text-[#fafafa] transition-colors">
          가이드
        </Link>
        <Link href="/" className="text-[13px] text-[#888] no-underline px-3.5 py-1.5 border border-[#333] rounded-lg hover:text-[#fafafa] hover:border-[#555] transition-all">
          ← 홈
        </Link>
      </div>
    </header>
  );
}
