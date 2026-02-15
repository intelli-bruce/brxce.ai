import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
  const token = process.env.THREADS_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "THREADS_ACCESS_TOKEN not set" }, { status: 500 });
  }

  try {
    // Fetch recent threads posts
    const res = await fetch(
      `https://graph.threads.net/v1.0/me/threads?fields=id,text,timestamp,permalink&access_token=${token}`
    );
    const data = await res.json();

    if (!data.data) {
      return NextResponse.json({ error: "No data from Threads API", detail: data }, { status: 500 });
    }

    let synced = 0;
    for (const post of data.data) {
      // Check if already exists
      const { data: existing } = await supabase
        .from("publications")
        .select("id")
        .eq("channel", "threads")
        .eq("channel_post_id", post.id)
        .single();

      if (existing) continue;

      // Create content
      const { data: content } = await supabase
        .from("contents")
        .insert({
          title: (post.text || "").slice(0, 100),
          body_md: post.text,
          status: "published",
          media_type: "text",
        })
        .select("id")
        .single();

      if (content) {
        await supabase.from("publications").insert({
          content_id: content.id,
          channel: "threads",
          channel_post_id: post.id,
          url: post.permalink,
          published_at: post.timestamp,
        });
        synced++;
      }
    }

    return NextResponse.json({ synced, total: data.data.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
