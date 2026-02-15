#!/usr/bin/env npx tsx
/**
 * Render Image Script (BrxceStudio)
 *
 * 이미지 프로젝트 JSON을 읽어서 Remotion renderStill로 단일 PNG를 렌더링합니다.
 *
 * 사용법:
 *   npx tsx scripts/render-image.ts <project.json> [options]
 *
 * 옵션:
 *   -o, --output <path>    출력 파일 경로 (기본: out/image/<composition>.png)
 *   --composition <id>     Composition ID 오버라이드
 *   --dry-run              렌더링 실행 없이 설정만 출력
 */

import * as fs from 'fs'
import * as path from 'path'

interface CliOptions {
  projectPath: string
  outputPath?: string
  compositionId?: string
  dryRun: boolean
}

interface ImageProjectInput {
  composition: string
  props: Record<string, unknown>
  width?: number
  height?: number
}

const TEMPLATE_SIZES: Record<string, { width: number; height: number }> = {
  OgImage: { width: 1200, height: 630 },
  SocialPost: { width: 1080, height: 1080 },
  Infographic: { width: 1080, height: 1920 },
  Quote: { width: 1080, height: 1080 },
  Thumbnail: { width: 1280, height: 720 },
}

const DEFAULT_OUTPUT_DIR = './out/image'

function parseArgs(): CliOptions | null {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printHelp()
    return null
  }

  const options: CliOptions = {
    projectPath: '',
    dryRun: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const next = args[i + 1]
    switch (arg) {
      case '-o':
      case '--output':
        options.outputPath = next!
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
BrxceStudio Image Render CLI

사용법:
  npx tsx scripts/render-image.ts <project.json> [options]

옵션:
  -o, --output <path>    출력 파일 경로 (기본: out/image/<composition>.png)
  --composition <id>     Composition ID 오버라이드
  --dry-run              렌더링 실행 없이 설정만 출력
  -h, --help             도움말 출력

프로젝트 JSON 형식:
  {
    "composition": "OgImage",
    "props": {
      "title": "Hello World",
      "subtitle": "A subtitle"
    }
  }

지원 Composition:
  OgImage      (1200x630)  - 블로그 OG 이미지
  SocialPost   (1080x1080) - SNS 정사각형 포스트
  Infographic  (1080x1920) - 세로 인포그래픽
  Quote        (1080x1080) - 인용구 카드
  Thumbnail    (1280x720)  - 영상 썸네일
`)
}

function loadProject(projectPath: string): ImageProjectInput | null {
  const resolvedPath = path.resolve(projectPath)
  if (!fs.existsSync(resolvedPath)) {
    console.error(`오류: 파일을 찾을 수 없습니다: ${resolvedPath}`)
    return null
  }

  try {
    const content = fs.readFileSync(resolvedPath, 'utf-8')
    return JSON.parse(content) as ImageProjectInput
  } catch (error) {
    console.error(`오류: JSON 파싱 실패: ${error}`)
    return null
  }
}

async function renderImage(
  project: ImageProjectInput,
  options: CliOptions,
): Promise<void> {
  const { renderStill } = await import('@remotion/renderer')
  const { bundle } = await import('@remotion/bundler' as string)

  const compositionId = options.compositionId || project.composition
  const templateSize = TEMPLATE_SIZES[compositionId]
  const width = project.width || templateSize?.width || 1080
  const height = project.height || templateSize?.height || 1080

  const outputPath =
    options.outputPath ||
    path.join(DEFAULT_OUTPUT_DIR, `${compositionId}.png`)

  console.log(`\n🖼️  이미지 렌더링 시작`)
  console.log(`   Composition: ${compositionId}`)
  console.log(`   크기: ${width}x${height}`)
  console.log(`   출력: ${outputPath}`)

  if (options.dryRun) {
    console.log('\n🔍 Dry run 모드 - 실제 렌더링을 실행하지 않습니다.')
    console.log(`   Props: ${JSON.stringify(project.props, null, 2)}`)
    return
  }

  // 출력 디렉토리 생성
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Remotion 번들
  console.log('\n📦 번들링...')
  const bundleLocation = await bundle({
    entryPoint: path.resolve(__dirname, '../index.ts'),
    webpackOverride: (config: Record<string, unknown>) => config,
  })

  // 렌더링
  console.log('   렌더링...')
  await renderStill({
    composition: {
      id: compositionId,
      width,
      height,
      fps: 1,
      durationInFrames: 1,
      defaultProps: project.props,
      props: project.props,
      defaultCodec: null,
      defaultOutName: null,
      defaultVideoImageFormat: null,
      defaultPixelFormat: null,
      defaultProResProfile: null,
    },
    serveUrl: bundleLocation,
    output: outputPath,
    inputProps: project.props,
  })

  console.log(`\n🎉 렌더링 완료! ${outputPath}`)
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

  await renderImage(project, options)
}

main().catch((err) => {
  console.error('❌ 오류 발생:', err)
  process.exit(1)
})
