import { NextResponse } from "next/server";

export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key = serviceKey || anonKey || "";
  
  let fetchResult: any = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/contents?select=id,title,status,category&status=in.(published,draft,review,ready)&order=created_at.asc&limit=5`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: 'no-store',
      }
    );
    fetchResult = {
      ok: res.ok,
      status: res.status,
      body: await res.text(),
    };
  } catch (e: any) {
    fetchError = e.message;
  }

  return NextResponse.json({
    hasServiceKey: !!serviceKey,
    serviceKeyPrefix: serviceKey?.slice(0, 20) || null,
    hasAnonKey: !!anonKey,
    supabaseUrl,
    fetchResult,
    fetchError,
  });
}
