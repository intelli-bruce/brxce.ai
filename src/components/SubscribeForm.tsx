"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMsg("구독 완료! 감사합니다 🦞");
        setEmail("");
      } else {
        setStatus("error");
        setMsg(data.error || "오류가 발생했습니다.");
      }
    } catch {
      setStatus("error");
      setMsg("네트워크 오류가 발생했습니다.");
    }
  }

  if (status === "success") {
    return (
      <div className="w-full text-center py-4">
        <p className="text-sm text-[#fafafa]">✅ {msg}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
          placeholder="이메일 주소를 입력하세요"
          className="flex-1 p-3 rounded-[10px] border border-[#333] bg-[#0a0a0a] text-[#fafafa] text-sm outline-none focus:border-[#555] transition-colors"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-3 rounded-[10px] bg-[#fafafa] text-[#0a0a0a] text-sm font-semibold cursor-pointer hover:bg-[#e0e0e0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {status === "loading" ? "..." : "구독"}
        </button>
      </div>
      {status === "error" && <p className="text-xs text-red-400 mt-1">{msg}</p>}
    </form>
  );
}
