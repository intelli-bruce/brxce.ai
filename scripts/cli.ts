import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://euhxmmiqfyptvsvvbbvp.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const sb = createClient(url, key);

const args = process.argv.slice(2);
const cmd = args[0];

function getFlag(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

async function list() {
  const status = getFlag("status");
  let q = sb.from("contents").select("id, title, status, category, created_at").order("created_at", { ascending: false }).limit(50);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) { console.error(error); return; }
  console.table(data?.map((d) => ({
    id: d.id.slice(0, 8),
    title: d.title.slice(0, 50),
    status: d.status,
    category: d.category || "-",
    date: new Date(d.created_at).toLocaleDateString("ko-KR"),
  })));
}

async function add() {
  const title = getFlag("title");
  const status = getFlag("status") || "idea";
  if (!title) { console.error("--title required"); return; }
  const { data, error } = await sb.from("contents").insert({ title, status }).select("id").single();
  if (error) { console.error(error); return; }
  console.log(`Created: ${data.id}`);
}

async function stats() {
  const [contents, ideas, pubs] = await Promise.all([
    sb.from("contents").select("status"),
    sb.from("ideas").select("id", { count: "exact", head: true }),
    sb.from("publications").select("id", { count: "exact", head: true }),
  ]);
  const byStatus: Record<string, number> = {};
  (contents.data || []).forEach((c) => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });
  console.log(`Contents: ${contents.data?.length || 0}`);
  console.log(`  By status:`, byStatus);
  console.log(`Ideas: ${ideas.count || 0}`);
  console.log(`Publications: ${pubs.count || 0}`);
}

async function syncThreads() {
  const res = await fetch(`${url.replace(/\/$/, "")}/functions/v1/sync-threads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
  }).catch(() => null);
  // Fallback: call local API
  if (!res || !res.ok) {
    console.log("Calling local API at http://localhost:3000/api/sync-threads");
    const local = await fetch("http://localhost:3000/api/sync-threads", { method: "POST" });
    const data = await local.json();
    console.log(data);
    return;
  }
  console.log(await res.json());
}

async function main() {
  switch (cmd) {
    case "list": await list(); break;
    case "add": await add(); break;
    case "stats": await stats(); break;
    case "sync-threads": await syncThreads(); break;
    default:
      console.log(`Usage: npx tsx scripts/cli.ts <command>
Commands:
  list [--status <status>]     List contents
  add --title "..." [--status] Add content
  stats                        Show stats
  sync-threads                 Sync from Threads`);
  }
}

main().catch(console.error);
