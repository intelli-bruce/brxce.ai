#!/usr/bin/env npx tsx
/**
 * Render Carousel Script (BrxceStudio)
 *
 * 캐러셀 프로젝트 JSON을 읽어서 Remotion renderStill로 슬라이드별 PNG를 렌더링합니다.
 *
 * 사용법:
 *   npx tsx scripts/render-carousel.ts <project.json> [options]
 *
 * 옵션:
 *   -o, --output <dir>     출력 디렉토리 (기본: out/carousel/)
 *   --composition <id>     Composition ID 오버라이드
 *   --dry-run              렌더링 실행 없이 설정만 출력
 */

import * as fs from 'fs'
import * as path from 'path'

interface CliOptions {
  projectPath: string
  outputDir: string
  compositionId?: string
  dryRun: boolean
}

interface CarouselProjectInput {
  composition: string
  props: Record<string, unknown>
  slideCount: number
  width?: number
  height?: number
}

const DEFAULT_OUTPUT_DIR = './out/carousel'
const DEFAULT_WIDTH = 1080
const DEFAULT_HEIGHT = 1350

function parseArgs(): CliOptions | null {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printHelp()
    return null
  }

  const options: CliOptions = {
    projectPath: '',
    outputDir: DEFAULT_OUTPUT_DIR,
    dryRun: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const next = args[i + 1]
    switch (arg) {
      case '-o':
      case '--output':
        options.outputDir = next!
        i++
        break
      case '--composition':
        options.compositionId = next
        i++
        break
      case '--dry-run':
        options.dryRun = true
        break
      default:
        if (!arg.startsWith('-') && !options.projectPath) {
          options.projectPath = arg
        }
    }
  }

  if (!options.projectPath) {
    console.error('오류: 프로젝트 JSON 파일 경로가 필요합니다.')
    printHelp()
    return null
  }

  return options
}

function printHelp(): void {
  console.log(`
BrxceStudio Carousel Render CLI

사용법:
  npx tsx scripts/render-carousel.ts <project.json> [options]

옵션:
  -o, --output <dir>     출력 디렉토리 (기본: out/carousel/)
  --composition <id>     Composition ID 오버라이드
  --dry-run              렌더링 실행 없이 설정만 출력
  -h, --help             도움말 출력

프로젝트 JSON 형식:
  {
    "composition": "CardNews",
    "slideCount": 5,
    "props": { ... }
  }
`)
}

function loadProject(projectPath: string): CarouselProjectInput | null {
  const resolvedPath = path.resolve(projectPath)
  if (!fs.existsSync(resolvedPath)) {
    console.error(`오류: 파일을 찾을 수 없습니다: ${resolvedPath}`)
    return null
  }

  try {
    const content = fs.readFileSync(resolvedPath, 'utf-8')
    return JSON.parse(content) as CarouselProjectInput
  } catch (error) {
    console.error(`오류: JSON 파싱 실패: ${error}`)
    return null
  }
}

async function renderSlides(
  project: CarouselProjectInput,
  options: CliOptions,
): Promise<void> {
  // dynamic import for Remotion renderer (ESM)
  const { renderStill } = await import('@remotion/renderer')
  const { bundle } = await import('@remotion/bundler' as string)

  const compositionId = options.compositionId || project.composition
  const width = project.width || DEFAULT_WIDTH
  const height = project.height || DEFAULT_HEIGHT

  console.log(`\n🎠 캐러셀 렌더링 시작`)
  console.log(`   Composition: ${compositionId}`)
  console.log(`   슬라이드 수: ${project.slideCount}`)
  console.log(`   크기: ${width}x${height}`)
  console.log(`   출력: ${options.outputDir}/`)

  if (options.dryRun) {
    console.log('\n🔍 Dry run 모드 - 실제 렌더링을 실행하지 않습니다.')
    for (let i = 0; i < project.slideCount; i++) {
      console.log(`   슬라이드 ${i}: slide_${String(i).padStart(2, '0')}.png`)
    }
    return
  }

  // 출력 디렉토리 생성
  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true })
  }

  // Remotion 번들
  console.log('\n📦 번들링...')
  const bundleLocation = await bundle({
    entryPoint: path.resolve(__dirname, '../index.ts'),
    webpackOverride: (config: Record<string, unknown>) => config,
  })

  // 각 슬라이드 렌더
  for (let i = 0; i < project.slideCount; i++) {
    const outputFile = path.join(
      options.outputDir,
      `slide_${String(i).padStart(2, '0')}.png`,
    )

    const slideProps = {
      ...project.props,
      slideIndex: i,
    }

    console.log(`   렌더링 슬라이드 ${i + 1}/${project.slideCount}...`)

    await renderStill({
      composition: {
        id: compositionId,
        width,
        height,
        fps: 1,
        durationInFrames: 1,
        defaultProps: slideProps,
        props: slideProps,
        defaultCodec: null,
        defaultOutName: null,
        defaultVideoImageFormat: null,
        defaultPixelFormat: null,
        defaultProResProfile: null,
      },
      serveUrl: bundleLocation,
      output: outputFile,
      inputProps: slideProps,
    })

    console.log(`   ✅ ${outputFile}`)
  }

  console.log(`\n🎉 렌더링 완료! ${project.slideCount}개 슬라이드 저장됨`)
}

async function main(): Promise<void> {
  const options = parseArgs()
  if (!options) {
    process.exit(1)
  }

  const project = loadProject(options.projectPath)
  if (!project) {
    process.exit(1)
  }

  await renderSlides(project, options)
}

main().catch((err) => {
  console.error('❌ 오류 발생:', err)
  process.exit(1)
})
