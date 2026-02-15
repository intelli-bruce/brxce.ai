export default function UnsubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">✉️</div>
        <h1 className="text-xl font-bold text-[#fafafa] mb-3">구독이 해지되었습니다</h1>
        <p className="text-sm text-[#888] leading-relaxed mb-6">
          뉴스레터 수신이 중단되었습니다.<br />
          다시 구독을 원하시면 brxce.ai에서 신청해주세요.
        </p>
        <a
          href="https://brxce.ai"
          className="inline-block px-6 py-3 rounded-xl bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold no-underline hover:bg-[#e0e0e0] transition-colors"
        >
          brxce.ai로 돌아가기
        </a>
      </div>
    </div>
  );
}
