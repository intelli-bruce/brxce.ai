"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface Subscriber {
  id: string;
  email: string;
  status: string;
  subscribed_at: string;
}

interface EmailLog {
  id: string;
  subject: string;
  sent_to_count: number;
  sent_at: string | null;
  status: string;
  created_at: string;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const [tab, setTab] = useState<"compose" | "subscribers" | "logs">("compose");

  const load = useCallback(async () => {
    const sb = createSupabaseBrowser();
    const [{ data: subs }, { data: el }] = await Promise.all([
      sb.from("subscribers").select("*").order("created_at", { ascending: false }),
      sb.from("email_logs").select("*").order("created_at", { ascending: false }),
    ]);
    if (subs) setSubscribers(subs);
    if (el) setLogs(el);
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeCount = subscribers.filter((s) => s.status === "subscribed").length;

  async function handleSend() {
    if (!subject || !bodyHtml) { setResult("제목과 본문을 입력하세요."); return; }
    if (!confirm(`구독자 ${activeCount}명에게 발송하시겠습니까?`)) return;
    setSending(true);
    setResult("");
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, bodyHtml }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(`✅ ${data.sentCount}/${data.total}명 발송 완료${data.errors?.length ? ` (${data.errors.length}건 실패)` : ""}`);
        setSubject("");
        setBodyHtml("");
        load();
      } else {
        setResult(`❌ ${data.error}`);
      }
    } catch {
      setResult("❌ 네트워크 오류");
    }
    setSending(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">뉴스레터</h1>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        {[
          { label: "전체 구독자", value: subscribers.length },
          { label: "활성 구독자", value: activeCount },
          { label: "발송 이력", value: logs.length },
        ].map((s) => (
          <div key={s.label} className="flex-1 p-4 rounded-xl border border-[#222] bg-[#141414]">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-[#888] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#222]">
        {(["compose", "subscribers", "logs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors bg-transparent cursor-pointer ${
              tab === t ? "border-[#fafafa] text-[#fafafa]" : "border-transparent text-[#888] hover:text-[#fafafa]"
            }`}
          >
            {t === "compose" ? "작성" : t === "subscribers" ? "구독자" : "발송 이력"}
          </button>
        ))}
      </div>

      {/* Compose */}
      {tab === "compose" && (
        <div className="space-y-4">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="뉴스레터 제목"
            className="w-full p-3 rounded-lg border border-[#333] bg-[#0a0a0a] text-[#fafafa] text-sm outline-none focus:border-[#555]"
          />
          <textarea
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            placeholder="본문 (HTML)"
            rows={12}
            className="w-full p-3 rounded-lg border border-[#333] bg-[#0a0a0a] text-[#fafafa] text-sm outline-none focus:border-[#555] font-mono resize-y"
          />
          <div className="flex items-center gap-4">
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-6 py-3 rounded-lg bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold cursor-pointer hover:bg-[#e0e0e0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? "발송 중..." : `${activeCount}명에게 발송`}
            </button>
            {result && <span className="text-sm">{result}</span>}
          </div>
        </div>
      )}

      {/* Subscribers */}
      {tab === "subscribers" && (
        <div className="border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] bg-[#141414]">
                <th className="text-left p-3 text-[#888] font-medium">이메일</th>
                <th className="text-left p-3 text-[#888] font-medium">상태</th>
                <th className="text-left p-3 text-[#888] font-medium">구독일</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-[#1a1a1a]">
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                      s.status === "subscribed" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-[#888]">{new Date(s.subscribed_at).toLocaleDateString("ko")}</td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr><td colSpan={3} className="p-6 text-center text-[#666]">구독자가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Logs */}
      {tab === "logs" && (
        <div className="border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] bg-[#141414]">
                <th className="text-left p-3 text-[#888] font-medium">제목</th>
                <th className="text-left p-3 text-[#888] font-medium">발송수</th>
                <th className="text-left p-3 text-[#888] font-medium">상태</th>
                <th className="text-left p-3 text-[#888] font-medium">발송일</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-[#1a1a1a]">
                  <td className="p-3">{l.subject}</td>
                  <td className="p-3">{l.sent_to_count}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                      l.status === "sent" ? "bg-green-900/30 text-green-400" : l.status === "failed" ? "bg-red-900/30 text-red-400" : "bg-yellow-900/30 text-yellow-400"
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3 text-[#888]">{l.sent_at ? new Date(l.sent_at).toLocaleDateString("ko") : "-"}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-[#666]">발송 이력이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
