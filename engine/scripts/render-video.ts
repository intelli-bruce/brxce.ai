#!/usr/bin/env npx tsx
/**
 * Render Video Script (BrxceStudio)
 *
 * 프로젝트 JSON을 읽어서 Remotion 렌더링을 실행합니다.
 *
 * 사용법:
 *   npx tsx scripts/render-video.ts <project.json> [options]
 *   echo '{"composition":"VSReel","props":{...}}' | npx tsx scripts/render-video.ts -
 *
 * 옵션:
 *   -o, --output <path>    출력 파일 경로 (기본: out/output.mp4)
 *   --composition <id>     Composition ID 오버라이드
 *   --dry-run              렌더링 실행 없이 명령어만 출력
 *   --props-only           props JSON만 출력
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const DEFAULT_OUTPUT_PATH = './out/output.mp4'

interface CliOptions {
  projectPath: string
  outputPath: string
  compositionId?: string
  dryRun: boolean
  propsOnly: boolean
}

interface ProjectInput {
  composition: string
  props: Record<string, unknown>
  width?: number
  height?: number
  fps?: number
  durationInFrames?: number
}

function parseArgs(): CliOptions | null {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printHelp()
    return null
  }

  const options: CliOptions = {
    projectPath: '',
    outputPath: DEFAULT_OUTPUT_PATH,
    dryRun: false,
    propsOnly: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const next = args[i + 1]
    switch (arg) {
      case '-o':
      case '--output':
        options.outputPath = next
        i++
        break
      case '--composition':
        options.compositionId = next
        i++
        break
      case '--dry-run':
        options.dryRun = true
        break
      case '--props-only':
        options.propsOnly = true
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
BrxceStudio Video Render CLI

사용법:
  npx tsx scripts/render-video.ts <project.json> [options]
  echo '{"composition":"VSReel","props":{}}' | npx tsx scripts/render-video.ts -

옵션:
  -o, --output <path>    출력 파일 경로 (기본: out/output.mp4)
  --composition <id>     Composition ID 오버라이드
  --dry-run              렌더링 실행 없이 명령어만 출력
  --props-only           props JSON만 출력
  -h, --help             도움말 출력
`)
}

function loadProject(projectPath: string): ProjectInput | null {
  let content: string

  if (projectPath === '-') {
    // stdin에서 읽기
    content = fs.readFileSync(0, 'utf-8')
  } else {
    const resolvedPath = path.resolve(projectPath)
    if (!fs.existsSync(resolvedPath)) {
      console.error(`오류: 파일을 찾을 수 없습니다: ${resolvedPath}`)
      return null
    }
    content = fs.readFileSync(resolvedPath, 'utf-8')
  }

  try {
    return JSON.parse(content) as ProjectInput
  } catch (error) {
    console.error(`오류: JSON 파싱 실패: ${error}`)
    return null
  }
}

function main(): void {
  const options = parseArgs()
  if (!options) {
    process.exit(1)
  }

  const project = loadProject(options.projectPath)
  if (!project) {
    process.exit(1)
  }

  const compositionId = options.compositionId || project.composition
  const propsJson = JSON.stringify(project.props)

  console.log(`\n📽️  프로젝트 로드됨`)
  console.log(`   Composition: ${compositionId}`)
  console.log(`   출력 파일: ${options.outputPath}`)

  if (options.propsOnly) {
    console.log('\n📋 Remotion Props:')
    console.log(JSON.stringify(project.props, null, 2))
    process.exit(0)
  }

  // 출력 디렉토리 생성
  const outputDir = path.dirname(options.outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const renderCommand = `npx remotion render ${compositionId} ${options.outputPath} --props='${propsJson.replace(/'/g, "\\'")}'`

  console.log(`\n🚀 렌더링 명령어:`)
  console.log(`   ${renderCommand.substring(0, 100)}...`)

  if (options.dryRun) {
    console.log('\n🔍 Dry run 모드 - 실제 렌더링을 실행하지 않습니다.')
    console.log('\n전체 명령어:')
    console.log(renderCommand)
    process.exit(0)
  }

  console.log('\n⏳ 렌더링 시작...\n')

  try {
    execSync(renderCommand, {
      stdio: 'inherit',
      cwd: process.cwd(),
    })

    console.log(`\n✅ 렌더링 완료: ${options.outputPath}`)

    const stats = fs.statSync(options.outputPath)
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
    console.log(`   파일 크기: ${sizeMB} MB`)
  } catch (error) {
    console.error('\n❌ 렌더링 실패:', error)
    process.exit(1)
  }
}

main()
