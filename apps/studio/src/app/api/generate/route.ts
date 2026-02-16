import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/**
 * POST /api/generate
 *
 * Triggers variant generation for a campaign atom.
 * Sets atom status to 'generating' and stores generation_config.
 *
 * In production: this would call OpenClaw Gateway to spawn a sub-agent.
 * For now: updates DB state so the generation polling loop can pick it up.
 *
 * Body:
 * - atom_id: string
 * - config: GenerationConfig
 * - type: "campaign" | "block" (default: campaign)
 * - block_index?: number (for block-level generation)
 * - block_prompt?: string (for block-level generation)
 * - content_id?: string (for block-level generation)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type = "campaign", atom_id, config, block_index, block_prompt, content_id } = body;

    if (type === "campaign") {
      // Campaign variant generation
      if (!atom_id) return NextResponse.json({ error: "atom_id required" }, { status: 400 });

      // Get atom + campaign context
      const { data: atom } = await sb.from("campaign_atoms").select("*, campaigns(*)").eq("id", atom_id).single();
      if (!atom) return NextResponse.json({ error: "atom not found" }, { status: 404 });

      // Update atom status
      await sb.from("campaign_atoms").update({
        status: "generating",
        generation_config: config || { variant_count: 3, diversity: "normal" },
      }).eq("id", atom_id);

      // Get style profile if exists
      const { data: profile } = await sb
        .from("style_profiles")
        .select("*")
        .or(`scope.eq.global,scope.eq.channel`)
        .limit(1)
        .maybeSingle();

      // Build generation task description
      const campaign = atom.campaigns;
      const task = buildCampaignPrompt(campaign, atom, config, profile);

      // TODO: Call OpenClaw Gateway to spawn sub-agent
      // For now, return the task so it can be manually triggered
      return NextResponse.json({
        ok: true,
        atom_id,
        status: "generating",
        task,
        message: "Atom marked as generating. Trigger sub-agent with the task below.",
      });

    } else if (type === "block") {
      // Block-level AI generation
      if (!content_id || block_index === undefined || !block_prompt) {
        return NextResponse.json({ error: "content_id, block_index, block_prompt required" }, { status: 400 });
      }

      // Get content blocks
      const { data: blocks } = await sb
        .from("content_blocks")
        .select("*")
        .eq("content_id", content_id)
        .order("position");

      if (!blocks?.length) return NextResponse.json({ error: "no blocks found" }, { status: 404 });

      const targetBlock = blocks[block_index];
      if (!targetBlock) return NextResponse.json({ error: "block_index out of range" }, { status: 400 });

      // Get content metadata for context
      const { data: content } = await sb.from("contents").select("title, category, tags").eq("id", content_id).single();

      const task = buildBlockPrompt(content, blocks, targetBlock, block_index, block_prompt);

      return NextResponse.json({
        ok: true,
        content_id,
        block_index,
        block_id: targetBlock.id,
        task,
        message: "Block generation task built. Trigger sub-agent with the task below.",
      });
    }

    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function buildCampaignPrompt(
  campaign: any,
  atom: any,
  config: any,
  profile: any,
): string {
  const lines = [
    `## 캠페인 Variant 생성`,
    ``,
    `**캠페인:** ${campaign?.title || "제목 없음"}`,
    `**주제:** ${campaign?.core_topic || ""}`,
    `**브리프:** ${campaign?.brief || ""}`,
    ``,
    `**포맷:** ${atom.format}`,
    `**채널:** ${atom.channel}`,
    `**생성 수:** ${config?.variant_count || 3}개`,
    `**다양성:** ${config?.diversity || "normal"}`,
  ];

  if (config?.feedback) {
    lines.push(`**피드백:** ${config.feedback}`);
  }
  if (config?.base_variant_id) {
    lines.push(`**기반 variant:** ${config.base_variant_id} (이 variant를 개선/변형)`);
  }
  if (profile) {
    lines.push(``, `**스타일 프로필:** ${profile.name}`);
    if (profile.patterns) lines.push(`- 패턴: ${profile.patterns}`);
    if (profile.anti_patterns) lines.push(`- 안티패턴: ${profile.anti_patterns}`);
  }

  lines.push(
    ``,
    `### 출력 형식`,
    `각 variant를 JSON으로 출력:`,
    `\`\`\`json`,
    `{ "variants": [{ "params": { "tone": "...", "hook_type": "..." }, "output": { "body": "본문..." } }] }`,
    `\`\`\``,
  );

  return lines.join("\n");
}

function buildBlockPrompt(
  content: any,
  blocks: any[],
  targetBlock: any,
  blockIndex: number,
  prompt: string,
): string {
  const blockLabel = `B${blockIndex + 1}`;
  const context = blocks.map((b, i) => {
    const label = `B${i + 1}`;
    const marker = i === blockIndex ? " ← [수정 대상]" : "";
    return `${label} (${b.block_type}): ${b.body.substring(0, 100)}...${marker}`;
  }).join("\n");

  return [
    `## 블록 수정 요청`,
    ``,
    `**콘텐츠:** ${content?.title || ""}`,
    `**카테고리:** ${content?.category || ""}`,
    `**태그:** ${(content?.tags || []).join(", ")}`,
    ``,
    `### 전체 블록 구조`,
    context,
    ``,
    `### 수정 대상: ${blockLabel} (${targetBlock.block_type})`,
    `**현재 내용:**`,
    targetBlock.body,
    ``,
    `### 수정 지시`,
    prompt,
    ``,
    `### 출력`,
    `수정된 블록 텍스트만 출력 (마크다운). JSON 아님.`,
  ].join("\n");
}
