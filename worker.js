export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API: 폼 제출 처리
    if (url.pathname === '/api/submit' && request.method === 'POST') {
      return handleSubmit(request, env);
    }

    // 나머지: static assets (Cloudflare가 자동 서빙)
    return env.ASSETS.fetch(request);
  }
};

async function handleSubmit(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://brxce.ai',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await request.json();
    const { email, type, product } = data;

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Invalid email' }, { status: 400, headers: corsHeaders });
    }

    // 1. Bruce님에게 알림 메일
    const notifySubject = type === 'inquiry'
      ? `[brxce.ai] 에이전틱 워크플로우 도입 문의 — ${email}`
      : `[brxce.ai] ${product} 대기 등록 — ${email}`;

    const notifyHtml = type === 'inquiry'
      ? `<p><strong>도입 문의</strong></p><p>이메일: ${email}</p><p>시간: ${new Date().toISOString()}</p>`
      : `<p><strong>${product} 대기 등록</strong></p><p>이메일: ${email}</p><p>시간: ${new Date().toISOString()}</p>`;

    await sendEmail(env.RESEND_API_KEY, {
      from: 'brxce.ai <noreply@brxce.ai>',
      to: 'bruce@brxce.ai',
      subject: notifySubject,
      html: notifyHtml,
    });

    // 2. 제출자에게 자동 응답 메일
    const autoResponse = type === 'inquiry'
      ? getInquiryAutoResponse(email)
      : getWaitlistAutoResponse(email, product);

    await sendEmail(env.RESEND_API_KEY, {
      from: 'Bruce Choe <bruce@brxce.ai>',
      to: email,
      subject: autoResponse.subject,
      html: autoResponse.html,
    });

    return Response.json({ success: true }, { headers: corsHeaders });

  } catch (err) {
    console.error('Submit error:', err);
    return Response.json({ error: 'Server error' }, { status: 500, headers: corsHeaders });
  }
}

async function sendEmail(apiKey, { from, to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error: ${res.status} ${err}`);
  }

  return res.json();
}

// ─── 자동 응답 메일 템플릿 ───

function getInquiryAutoResponse(email) {
  return {
    subject: '[brxce.ai] 문의 감사합니다 🦞',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:40px 24px;">
    
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:32px;margin-bottom:8px;">🦞</div>
      <div style="font-size:20px;font-weight:700;color:#fafafa;">brxce.ai</div>
    </div>

    <div style="background:#141414;border:1px solid #222;border-radius:12px;padding:32px 24px;">
      <p style="color:#fafafa;font-size:16px;font-weight:600;margin:0 0 16px;">안녕하세요, Bruce입니다.</p>
      
      <p style="color:#ccc;font-size:14px;line-height:1.7;margin:0 0 16px;">
        에이전틱 워크플로우 도입 문의 감사합니다!
      </p>

      <p style="color:#ccc;font-size:14px;line-height:1.7;margin:0 0 16px;">
        현재 업무 프로세스를 듣고, OpenClaw × ClaudeCode를 활용한
        에이전틱 워크플로우 적용 가능 여부를 진단해드리겠습니다.
      </p>

      <p style="color:#ccc;font-size:14px;line-height:1.7;margin:0 0 24px;">
        24시간 내에 연락드리겠습니다.<br>
        이 메일에 직접 답장 주셔도 됩니다.
      </p>

      <div style="border-top:1px solid #333;padding-top:20px;margin-top:20px;">
        <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
          그 사이, 제가 어떤 일을 하는지 궁금하시다면:<br>
          <a href="https://www.threads.com/@brxce.ai" style="color:#fafafa;text-decoration:underline;">→ Threads @brxce.ai</a>
        </p>
      </div>
    </div>

    <div style="text-align:center;margin-top:32px;">
      <p style="color:#555;font-size:12px;margin:0;">
        Bruce Choe · <a href="https://brxce.ai" style="color:#555;">brxce.ai</a>
      </p>
    </div>

  </div>
</body>
</html>`
  };
}

function getWaitlistAutoResponse(email, product) {
  return {
    subject: `[brxce.ai] ${product} 대기 등록 완료 🦞`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:40px 24px;">
    
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:32px;margin-bottom:8px;">🦞</div>
      <div style="font-size:20px;font-weight:700;color:#fafafa;">brxce.ai</div>
    </div>

    <div style="background:#141414;border:1px solid #222;border-radius:12px;padding:32px 24px;">
      <p style="color:#fafafa;font-size:16px;font-weight:600;margin:0 0 16px;">안녕하세요, Bruce입니다.</p>
      
      <p style="color:#ccc;font-size:14px;line-height:1.7;margin:0 0 16px;">
        <strong style="color:#fafafa;">${product}</strong> 대기 등록 감사합니다!<br>
        오픈하면 가장 먼저 보내드리겠습니다.
      </p>

      <p style="color:#ccc;font-size:14px;line-height:1.7;margin:0 0 24px;">
        기다리시는 동안, 에이전틱 워크플로우가 궁금하시다면:<br>
        <a href="https://www.threads.com/@brxce.ai" style="color:#fafafa;text-decoration:underline;">→ Threads @brxce.ai</a>
      </p>
    </div>

    <div style="text-align:center;margin-top:32px;">
      <p style="color:#555;font-size:12px;margin:0;">
        Bruce Choe · <a href="https://brxce.ai" style="color:#555;">brxce.ai</a>
      </p>
    </div>

  </div>
</body>
</html>`
  };
}
