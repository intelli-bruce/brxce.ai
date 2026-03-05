import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { getCarousel } from '@/lib/studio/carousel-store'
import { canvas } from '@/lib/studio/slide-tokens'

const execFileAsync = promisify(execFile)

type Ctx = { params: Promise<{ id: string }> }

export const runtime = 'nodejs'

async function renderSlide(id: string, slideIndex: number, scale: number = 1): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: true })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: canvas.width, height: canvas.height, deviceScaleFactor: scale })

    const url = `http://localhost:3200/render/${id}?slide=${slideIndex}`
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 })

    await page.waitForSelector('#slide-root', { timeout: 30_000 })
    const slideRoot = await page.$('#slide-root')
    if (!slideRoot) throw new Error('slide root not found')

    const png = (await slideRoot.screenshot({ type: 'png' })) as Buffer
    return png
  } finally {
    await browser.close()
  }
}

async function zipPngs(files: Array<{ name: string; buffer: Buffer }>): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), 'carousel-render-'))
  const zipPath = join(dir, 'slides.zip')

  try {
    await Promise.all(files.map((f) => writeFile(join(dir, f.name), f.buffer)))
    await execFileAsync('/usr/bin/zip', ['-j', '-q', zipPath, ...files.map((f) => join(dir, f.name))])
    return await readFile(zipPath)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

/**
 * GET /api/carousels/:id/render?slide=0          -> single slide PNG (1x)
 * GET /api/carousels/:id/render?slide=0&scale=2  -> single slide PNG (2x)
 * GET /api/carousels/:id/render                  -> all slides ZIP (PNG 1x)
 * GET /api/carousels/:id/render?scale=2          -> all slides ZIP (PNG 2x)
 */
export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const { searchParams } = new URL(req.url)
  const slide = searchParams.get('slide')
  const scale = Math.min(Math.max(Number(searchParams.get('scale') ?? '1'), 1), 3)

  const carousel = await getCarousel(id)
  if (!carousel) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  try {
    if (slide !== null) {
      const slideIndex = Number(slide)
      if (!Number.isInteger(slideIndex) || slideIndex < 0 || slideIndex >= carousel.slides.length) {
        return NextResponse.json({ error: 'invalid slide index' }, { status: 400 })
      }

      const png = await renderSlide(id, slideIndex, scale)
      return new NextResponse(png as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `inline; filename="slide-${String(slideIndex + 1).padStart(2, '0')}${scale > 1 ? `@${scale}x` : ''}.png"`,
          'Cache-Control': 'no-store',
        },
      })
    }

    const rendered = await Promise.all(
      carousel.slides.map(async (_s, idx) => ({
        name: `slide-${String(idx + 1).padStart(2, '0')}${scale > 1 ? `@${scale}x` : ''}.png`,
        buffer: await renderSlide(id, idx, scale),
      }))
    )

    const zip = await zipPngs(rendered)
    return new NextResponse(zip as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${id}${scale > 1 ? `@${scale}x` : ''}.zip"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'render failed' }, { status: 500 })
  }
}
