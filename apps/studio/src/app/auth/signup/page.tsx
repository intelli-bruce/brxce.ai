"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const sb = createSupabaseBrowser();
    const { error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-xl font-bold mb-2">확인 이메일을 보냈습니다</h1>
          <p className="text-[#888] text-sm">이메일의 링크를 클릭하면 가입이 완료됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-[360px] flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center mb-2">회원가입</h1>

        <SocialLoginButtons />

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-[#333]" />
          <span className="text-xs text-[#666]">또는</span>
          <div className="flex-1 h-px bg-[#333]" />
        </div>

        {error && <div className="text-red-400 text-sm text-center">{error}</div>}

        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className="w-full p-3.5 rounded-[10px] border border-[#333] bg-[#0a0a0a] text-[#fafafa] text-sm outline-none focus:border-[#555]"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            required
            className="w-full p-3.5 rounded-[10px] border border-[#333] bg-[#0a0a0a] text-[#fafafa] text-sm outline-none focus:border-[#555]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (6자 이상)"
            required
            minLength={6}
            className="w-full p-3.5 rounded-[10px] border border-[#333] bg-[#0a0a0a] text-[#fafafa] text-sm outline-none focus:border-[#555]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3.5 rounded-[10px] bg-[#fafafa] text-[#0a0a0a] text-[15px] font-semibold cursor-pointer hover:bg-[#e0e0e0] disabled:opacity-50"
          >
            {loading ? "가입 중..." : "이메일로 가입하기"}
          </button>
        </form>

        <p className="text-center text-sm text-[#888]">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="text-[#fafafa] underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
