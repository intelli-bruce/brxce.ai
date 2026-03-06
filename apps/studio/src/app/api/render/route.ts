import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { mapProjectToRemotionProps } from '@/lib/studio/props-mapper'
import type { StudioProject } from '@/lib/studio/types'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const ENGINE_DIR = path.resolve(process.cwd(), '../../engine')
const STORAGE_BUCKET = 'studio-renders'

/**
 * POST /api/render
 * Body: { project_id: string }
 *
 * 1. DB에서 프로젝트 조회
 * 2. props-mapper로 Remotion props 변환
 * 3. Remotion CLI로 렌더링
 * 4. Supabase Storage 업로드
 * 5. DB output_urls 업데이트
 */
export async function POST(req: NextRequest) {
  const { project_id } = await req.json()
  if (!project_id) {
    return NextResponse.json({ error: 'project_id required' }, { status: 400 })
  }

  // 1. 프로젝트 조회
  const { data: project, error: fetchErr } = await sb
    .from('studio_projects')
    .select('*')
    .eq('id', project_id)
    .single()

  if (fetchErr || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // status → rendering
  await sb.from('studio_projects').update({
    status: 'rendering',
    updated_at: new Date().toISOString(),
  }).eq('id', project_id)

  try {
    const mapped = mapProjectToRemotionProps(project as StudioProject)
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'brxce-render-'))
    const outputUrls: string[] = []

    if (mapped.type === 'video') {
      // Video render
      const outFile = path.join(tmpDir, 'output.mp4')
      const propsFile = path.join(tmpDir, 'props.json')
      fs.writeFileSync(propsFile, JSON.stringify(mapped.props))

      const durationFlag = mapped.durationInFrames
        ? `--frames=0-${mapped.durationInFrames - 1}`
        : ''

      execSync(
        `npx remotion render ${mapped.compositionId} ${outFile} --props="${propsFile}" ${durationFlag}`,
        { cwd: ENGINE_DIR, stdio: 'pipe', timeout: 600_000 },
      )

      const url = await uploadToStorage(outFile, project_id, 'output.mp4', 'video/mp4')
      outputUrls.push(url)

    } else if (mapped.slideCount && mapped.slideCount > 0) {
      // Carousel render (multiple stills)
      for (let i = 0; i < mapped.slideCount; i++) {
        const slideProps = { ...mapped.props, slideIndex: i }
        const propsFile = path.join(tmpDir, `props-${i}.json`)
        const outFile = path.join(tmpDir, `slide-${i}.png`)
        fs.writeFileSync(propsFile, JSON.stringify(slideProps))

        execSync(
          `npx remotion still ${mapped.compositionId} ${outFile} --props="${propsFile}"`,
          { cwd: ENGINE_DIR, stdio: 'pipe', timeout: 120_000 },
        )

        const url = await uploadToStorage(outFile, project_id, `slide-${i}.png`, 'image/png')
        outputUrls.push(url)
      }

    } else {
      // Single image render (Still)
      const outFile = path.join(tmpDir, 'output.png')
      const propsFile = path.join(tmpDir, 'props.json')
      fs.writeFileSync(propsFile, JSON.stringify(mapped.props))

      execSync(
        `npx remotion still ${mapped.compositionId} ${outFile} --props="${propsFile}"`,
        { cwd: ENGINE_DIR, stdio: 'pipe', timeout: 120_000 },
      )

      const url = await uploadToStorage(outFile, project_id, 'output.png', 'image/png')
      outputUrls.push(url)
    }

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true })

    // 5. DB 업데이트
    await sb.from('studio_projects').update({
      status: 'rendered',
      output_urls: outputUrls,
      render_log: `Rendered ${outputUrls.length} file(s) at ${new Date().toISOString()}`,
      updated_at: new Date().toISOString(),
    }).eq('id', project_id)

    return NextResponse.json({ ok: true, output_urls: outputUrls })

  } catch (err: any) {
    const errorMessage = err.stderr?.toString() || err.message || 'Unknown render error'

    await sb.from('studio_projects').update({
      status: 'failed',
      render_log: errorMessage.slice(0, 5000),
      updated_at: new Date().toISOString(),
    }).eq('id', project_id)

    return NextResponse.json({ error: 'Render failed', detail: errorMessage.slice(0, 1000) }, { status: 500 })
  }
}

async function uploadToStorage(
  localPath: string,
  projectId: string,
  filename: string,
  contentType: string,
): Promise<string> {
  const fileBuffer = fs.readFileSync(localPath)
  const storagePath = `renders/${projectId}/${filename}`

  const { error } = await sb.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}
