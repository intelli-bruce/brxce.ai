"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Template {
  id: string;
  slug: string;
  name: string;
  subject: string;
  header_name: string;
  header_handle: string;
  greeting: string;
  body: string;
  cta_text: string;
  cta_url: string;
  signoff_name: string;
  signoff_desc: string;
  signoff_url: string;
  footer_text: string;
  match_product: string | null;
  is_default: boolean;
  updated_at?: string;
}

function buildHtml(t: Template): string {
  const bodyHtml = t.body.replace(/\n/g, "<br/>");
  const ctaBlock = t.cta_text && t.cta_url
    ? `<a href="${t.cta_url}" style="display:inline-block;margin:24px 0 8px;padding:14px 28px;background:#fafafa;color:#0a0a0a;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.3px;">${t.cta_text}</a>`
    : "";
  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
<tr><td align="center" style="padding:48px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="padding-bottom:28px;border-bottom:1px solid #222;">
  <div style="font-size:20px;font-weight:800;color:#fafafa;letter-spacing:-0.3px;">${t.header_name}</div>
  <div style="font-size:13px;color:#666;margin-top:2px;">${t.header_handle}</div>
</td></tr>
<tr><td style="padding:36px 0 28px;font-size:15px;line-height:1.8;color:#bbb;">
  <p style="margin:0 0 20px;color:#eee;font-size:16px;">${t.greeting}</p>
  <div style="margin:0 0 20px;">${bodyHtml}</div>
  ${ctaBlock}
  <p style="margin:24px 0 0;color:#888;font-size:14px;">궁금한 게 있으시면 그냥 답장 주세요. 직접 답변드립니다.</p>
</td></tr>
<tr><td style="padding:24px 0;border-top:1px solid #222;">
  <div style="font-size:15px;font-weight:700;color:#fafafa;">${t.signoff_name}</div>
  <div style="font-size:13px;color:#666;margin-top:4px;">${t.signoff_desc}</div>
  <a href="${t.signoff_url}" style="font-size:13px;color:#555;text-decoration:none;margin-top:2px;display:inline-block;">${t.signoff_url.replace("https://","")}</a>
</td></tr>
<tr><td style="padding-top:20px;border-top:1px solid #1a1a1a;text-align:center;">
  <p style="font-size:11px;color:#444;margin:0;">${t.footer_text}</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function Field({ label, value, onChange, multiline }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean;
}) {
  return (
    <div className="mb-3">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555] mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#eee] resize-y focus:outline-none focus:border-[#444] transition-colors"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#eee] focus:outline-none focus:border-[#444] transition-colors"
        />
      )}
    </div>
  );
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/email-templates");
    const data = await res.json();
    if (Array.isArray(data)) {
      setTemplates(data);
      if (!selected && data.length > 0) setSelected(data[0]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (iframeRef.current && selected) {
      const doc = iframeRef.current.contentDocument;
      if (doc) { doc.open(); doc.write(buildHtml(selected)); doc.close(); }
    }
  }, [selected]);

  function update(key: keyof Template, value: string) {
    if (!selected) return;
    setSelected((prev) => prev ? { ...prev, [key]: value } : prev);
    setSaved(false);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/email-templates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected),
    });
    setSaving(false);
    setSaved(true);
    const res = await fetch("/api/email-templates");
    const data = await res.json();
    if (Array.isArray(data)) setTemplates(data);
  }

  function copyHtml() {
    if (selected) navigator.clipboard.writeText(buildHtml(selected));
  }

  function selectTemplate(t: Template) {
    setSelected(t);
    setSaved(false);
  }

  if (!selected) return <div className="p-10 text-[#666]">로딩 중...</div>;

  return (
    <div className="flex h-screen">
      {/* Left — List + Preview */}
      <div className="w-1/2 bg-[#0a0a0a] border-r border-[#222] flex flex-col">
        {/* Template List */}
        <div className="border-b border-[#222]">
          <div className="px-5 py-3 flex items-center justify-between">
            <h1 className="text-base font-bold text-[#fafafa]">이메일 템플릿</h1>
            <span className="text-xs text-[#555]">{templates.length}개</span>
          </div>
          <div className="max-h-[220px] overflow-auto">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTemplate(t)}
                className={`w-full text-left px-5 py-3 border-b border-[#111] cursor-pointer transition-colors ${
                  selected.id === t.id
                    ? "bg-[#151515]"
                    : "bg-transparent hover:bg-[#0d0d0d]"
                }`}
                style={{ border: "none", borderBottom: "1px solid #111" }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm font-medium ${selected.id === t.id ? "text-[#fafafa]" : "text-[#aaa]"}`}>
                    {t.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {t.is_default && (
                      <span className="text-[10px] bg-[#222] text-[#888] px-1.5 py-0.5 rounded">기본</span>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-[#555] truncate">{t.subject}</div>
                {t.match_product && (
                  <div className="text-[10px] text-[#444] mt-0.5 truncate">→ {t.match_product}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-5 py-2.5 border-b border-[#222] flex items-center justify-between">
            <span className="text-xs text-[#666]">미리보기</span>
            <span className="text-[10px] text-[#444]">{selected.subject}</span>
          </div>
          <div className="flex-1 overflow-auto p-4 flex justify-center">
            <iframe
              ref={iframeRef}
              className="w-full max-w-[560px] h-full border-0 rounded-lg"
              style={{ background: "#0a0a0a" }}
            />
          </div>
        </div>
      </div>

      {/* Right — Editor */}
      <div className="w-1/2 bg-[#050505] flex flex-col">
        <div className="px-5 py-3 border-b border-[#222] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#fafafa]">{selected.name}</h2>
            <p className="text-[11px] text-[#555] mt-0.5">{selected.slug}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyHtml}
              className="text-xs bg-[#222] text-[#aaa] px-3 py-1.5 rounded-lg font-medium hover:bg-[#333] transition-colors cursor-pointer border-none"
            >
              HTML 복사
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="text-xs bg-[#fafafa] text-[#0a0a0a] px-4 py-1.5 rounded-lg font-semibold hover:bg-[#ddd] transition-colors cursor-pointer border-none disabled:opacity-50"
            >
              {saving ? "저장 중..." : saved ? "✓ 저장됨" : "저장"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">
          <Field label="제목 (Subject)" value={selected.subject} onChange={(v) => update("subject", v)} />
          <div className="flex gap-3">
            <div className="flex-1"><Field label="보내는 사람" value={selected.header_name} onChange={(v) => update("header_name", v)} /></div>
            <div className="flex-1"><Field label="핸들" value={selected.header_handle} onChange={(v) => update("header_handle", v)} /></div>
          </div>
          <Field label="인사" value={selected.greeting} onChange={(v) => update("greeting", v)} />
          <Field label="본문" value={selected.body} onChange={(v) => update("body", v)} multiline />
          <div className="flex gap-3">
            <div className="flex-1"><Field label="CTA 텍스트" value={selected.cta_text || ""} onChange={(v) => update("cta_text", v)} /></div>
            <div className="flex-1"><Field label="CTA URL" value={selected.cta_url || ""} onChange={(v) => update("cta_url", v)} /></div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1"><Field label="서명 이름" value={selected.signoff_name} onChange={(v) => update("signoff_name", v)} /></div>
            <div className="flex-1"><Field label="서명 설명" value={selected.signoff_desc} onChange={(v) => update("signoff_desc", v)} /></div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1"><Field label="서명 URL" value={selected.signoff_url} onChange={(v) => update("signoff_url", v)} /></div>
            <div className="flex-1"><Field label="푸터" value={selected.footer_text} onChange={(v) => update("footer_text", v)} /></div>
          </div>

          {selected.match_product && (
            <div className="mt-3 p-3 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
              <div className="text-[10px] text-[#555] uppercase tracking-wider mb-1">자동 매칭 product</div>
              <div className="text-xs text-[#777]">{selected.match_product}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
