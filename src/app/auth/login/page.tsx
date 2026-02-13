"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const sb = createSupabaseBrowser();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <form onSubmit={handleLogin} className="w-full max-w-[360px] flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center mb-4">로그인</h1>
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
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
          placeholder="비밀번호"
          required
          className="w-full p-3.5 rounded-[10px] border border-[#333] bg-[#0a0a0a] text-[#fafafa] text-sm outline-none focus:border-[#555]"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-3.5 rounded-[10px] bg-[#fafafa] text-[#0a0a0a] text-[15px] font-semibold cursor-pointer hover:bg-[#e0e0e0] disabled:opacity-50"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
        <p className="text-center text-sm text-[#888]">
          계정이 없으신가요?{" "}
          <Link href="/auth/signup" className="text-[#fafafa] underline">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
}
