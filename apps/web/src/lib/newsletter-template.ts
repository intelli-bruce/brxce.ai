export function newsletterHtml(subject: string, bodyHtml: string, unsubscribeUrl: string) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<!-- Header -->
<tr><td style="padding-bottom:24px;border-bottom:1px solid #333;">
<span style="font-size:18px;font-weight:700;color:#fafafa;">Bruce Choe</span>
<span style="font-size:13px;color:#888;margin-left:8px;">@brxce.ai</span>
</td></tr>
<!-- Body -->
<tr><td style="padding:32px 0;font-size:15px;line-height:1.7;color:#ccc;">
${bodyHtml}
</td></tr>
<!-- Footer -->
<tr><td style="padding-top:24px;border-top:1px solid #333;text-align:center;">
<p style="font-size:12px;color:#666;margin:0 0 8px;">
이 메일은 brxce.ai 뉴스레터를 구독하셔서 발송되었습니다.
</p>
<a href="${unsubscribeUrl}" style="font-size:12px;color:#888;text-decoration:underline;">구독 해지</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
