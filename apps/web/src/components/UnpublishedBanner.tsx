const STATUS_LABELS: Record<string, string> = {
  idea: "아이디어",
  draft: "초안",
  "fact-check": "팩트체크",
  review: "검토 중",
  ready: "발행 대기",
};

export default function UnpublishedBanner({ status }: { status: string }) {
  return (
    <div className="bg-yellow-900/40 border-b border-yellow-700/50 px-6 py-2.5 text-center text-sm text-yellow-300">
      ⚠️ 미발행 콘텐츠 — 관리자만 볼 수 있습니다
      <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-800/60 text-xs font-medium">
        {STATUS_LABELS[status] || status}
      </span>
    </div>
  );
}
