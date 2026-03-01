// 웨이트리스트 신청 직후 자동 발송 이메일 템플릿

export interface WaitlistTemplate {
  subject: string;
  bodyHtml: string;
}

const TEMPLATES: Record<string, WaitlistTemplate> = {
  default: {
    subject: "🦞 신청 완료 — 곧 안내드리겠습니다",
    bodyHtml: `
<p style="margin:0 0 16px;font-size:16px;color:#fafafa;">안녕하세요,</p>
<p style="margin:0 0 16px;">에이전틱 워크플로우에 관심 가져주셔서 감사합니다.<br/>
신청하신 가이드는 준비되는 대로 이 메일로 보내드리겠습니다.</p>
<p style="margin:0 0 24px;">궁금한 점이 있으시면 편하게 답장해주세요.<br/>
직접 읽고 직접 답변드립니다.</p>
<p style="margin:0 0 8px;color:#fafafa;">Bruce Choe</p>
<p style="margin:0;font-size:13px;color:#888;">에이전틱 워크플로우로 회사를 운영하는 사람<br/>
<a href="https://brxce.ai" style="color:#888;">brxce.ai</a></p>`,
  },
  "OpenClaw이 뭔데? — 에이전틱 워크플로우 실행 도구": {
    subject: "🦞 OpenClaw 가이드 신청 완료",
    bodyHtml: `
<p style="margin:0 0 16px;font-size:16px;color:#fafafa;">안녕하세요,</p>
<p style="margin:0 0 16px;"><strong>"OpenClaw이 뭔데?"</strong> 가이드를 신청해주셨네요.</p>
<p style="margin:0 0 16px;">짧게 말하면 — AI 에이전트를 실제 업무에 붙이는 도구입니다.<br/>
ChatGPT 대화창과는 다릅니다. 에이전트가 직접 일을 합니다.</p>
<p style="margin:0 0 16px;">가이드가 준비되면 바로 보내드리겠습니다.<br/>
그 사이에 먼저 둘러보셔도 좋습니다:</p>
<p style="margin:0 0 24px;">
→ <a href="https://brxce.ai/guides" style="color:#60a5fa;text-decoration:underline;">에이전틱 워크플로우 가이드</a>
</p>
<p style="margin:0 0 16px;">궁금한 게 있으시면 그냥 답장 주세요. 직접 답변드립니다.</p>
<p style="margin:0 0 8px;color:#fafafa;">Bruce Choe</p>
<p style="margin:0;font-size:13px;color:#888;">에이전틱 워크플로우로 회사를 운영하는 사람<br/>
<a href="https://brxce.ai" style="color:#888;">brxce.ai</a></p>`,
  },
  "OpenClaw 설치 + Opus 4.6 설정 가이드": {
    subject: "🦞 OpenClaw 설치 가이드 신청 완료",
    bodyHtml: `
<p style="margin:0 0 16px;font-size:16px;color:#fafafa;">안녕하세요,</p>
<p style="margin:0 0 16px;"><strong>OpenClaw 설치 + 설정 가이드</strong>를 신청해주셨네요.</p>
<p style="margin:0 0 16px;">설치부터 실전 세팅까지 정리 중입니다.<br/>
완성되면 바로 이 메일로 보내드리겠습니다.</p>
<p style="margin:0 0 24px;">먼저 에이전틱 워크플로우가 뭔지 궁금하시다면:<br/>
→ <a href="https://brxce.ai/guides" style="color:#60a5fa;text-decoration:underline;">에이전틱 워크플로우 가이드</a>
</p>
<p style="margin:0 0 16px;">궁금한 점 있으시면 편하게 답장 주세요.</p>
<p style="margin:0 0 8px;color:#fafafa;">Bruce Choe</p>
<p style="margin:0;font-size:13px;color:#888;">에이전틱 워크플로우로 회사를 운영하는 사람<br/>
<a href="https://brxce.ai" style="color:#888;">brxce.ai</a></p>`,
  },
  "오픈클로(OpenClaw) 실전 가이드 — AI 에이전트로 회사 운영하는 법": {
    subject: "🦞 실전 가이드 신청 완료 — 곧 보내드립니다",
    bodyHtml: `
<p style="margin:0 0 16px;font-size:16px;color:#fafafa;">안녕하세요,</p>
<p style="margin:0 0 16px;"><strong>"AI 에이전트로 회사 운영하는 법"</strong> 가이드를 신청해주셨네요.</p>
<p style="margin:0 0 16px;">실제로 제가 1인 법인을 에이전트로 운영하면서 쌓은 내용입니다.<br/>
정리가 끝나는 대로 보내드리겠습니다.</p>
<p style="margin:0 0 24px;">먼저 둘러보시려면:<br/>
→ <a href="https://brxce.ai/guides" style="color:#60a5fa;text-decoration:underline;">에이전틱 워크플로우 가이드</a>
</p>
<p style="margin:0 0 16px;">궁금한 점은 답장으로 편하게 보내주세요.</p>
<p style="margin:0 0 8px;color:#fafafa;">Bruce Choe</p>
<p style="margin:0;font-size:13px;color:#888;">에이전틱 워크플로우로 회사를 운영하는 사람<br/>
<a href="https://brxce.ai" style="color:#888;">brxce.ai</a></p>`,
  },
};

export function getWaitlistTemplate(product: string): WaitlistTemplate {
  return TEMPLATES[product] || TEMPLATES.default;
}

export function waitlistEmailHtml(template: WaitlistTemplate): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${template.subject}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding-bottom:24px;border-bottom:1px solid #333;">
<span style="font-size:18px;font-weight:700;color:#fafafa;">Bruce Choe</span>
<span style="font-size:13px;color:#888;margin-left:8px;">@brxce.ai</span>
</td></tr>
<tr><td style="padding:32px 0;font-size:15px;line-height:1.7;color:#ccc;">
${template.bodyHtml}
</td></tr>
<tr><td style="padding-top:24px;border-top:1px solid #333;text-align:center;">
<p style="font-size:12px;color:#666;margin:0;">brxce.ai — 에이전틱 워크플로우</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
