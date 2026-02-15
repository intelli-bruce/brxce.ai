#!/usr/bin/env npx tsx
/**
 * Thumbnail Extraction Script (BrxceStudio 이식판)
 *
 * media-catalog.json에서 비디오 목록을 읽어 대표 프레임을 추출합니다.
 *
 * 사용법:
 *   npx tsx scripts/extract-thumbnails.ts [options]
 *
 * 옵션:
 *   --catalog <path>   미디어 카탈로그 JSON (기본: ./data/media-catalog.json)
 *   --output <path>    썸네일 출력 디렉토리 (기본: ./data/thumbnails)
 *   --frames <n>       비디오당 추출할 프레임 수 (기본: 3)
 *   --size <WxH>       썸네일 크기 (기본: 640x360)
 *   --quality <n>      JPEG 품질 1-31, 낮을수록 좋음 (기본: 5)
 *   --mode <mode>      추출 모드: even (균등), scene (장면감지) (기본: even)
 *   --force            기존 썸네일 덮어쓰기
 *   --limit <n>        처리할 비디오 수 제한
 */

import { spawnSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

const DEFAULT_CATALOG = './data/media-catalog.json'
const DEFAULT_OUTPUT_DIR = './data/thumbnails'

interface MediaItem {
  id: string
  filePath: string
  fileName: string
  mediaType: string
  duration?: number
}

interface CliOptions {
  catalogPath: string
  outputDir: string
  framesPerVideo: number
  size: string
  quality: number
  mode: 'even' | 'scene'
  force: boolean
  limit?: number
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2)
  const options: CliOptions = {
    catalogPath: DEFAULT_CATALOG,
    outputDir: DEFAULT_OUTPUT_DIR,
    framesPerVideo: 3,
    size: '640x360',
    quality: 5,
    mode: 'even',
    force: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const next = args[i + 1]
    switch (arg) {
      case '--catalog': options.catalogPath = next; i++; break
      case '--output': options.outputDir = next; i++; break
      case '--frames': options.framesPerVideo = parseInt(next, 10); i++; break
      case '--size': options.size = next; i++; break
      case '--quality': options.quality = parseInt(next, 10); i++; break
      case '--mode': options.mode = next as 'even' | 'scene'; i++; break
      case '--force': options.force = true; break
      case '--limit': options.limit = parseInt(next, 10); i++; break
    }
  }

  return options
}

function getVideoDuration(filePath: string): number | null {
  try {
    const result = spawnSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath,
    ], { encoding: 'utf-8' })
    if (result.status === 0 && result.stdout) return parseFloat(result.stdout.trim())
  } catch { /* ignore */ }
  return null
}

function extractEvenFrames(
  videoPath: string, outputDir: string, videoId: string,
  numFrames: number, size: string, quality: number, duration: number
): string[] {
  const thumbnails: string[] = []
  const [width, height] = size.split('x')

  for (let i = 0; i < numFrames; i++) {
    const position = duration * ((i + 0.5) / numFrames)
    const outputPath = path.join(outputDir, `${videoId}_${i + 1}.jpg`)

    try {
      const result = spawnSync('ffmpeg', [
        '-y', '-ss', position.toFixed(2), '-i', videoPath,
        '-vframes', '1',
        '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
        '-q:v', quality.toString(), '-update', '1', outputPath,
      ], { encoding: 'utf-8', stdio: 'pipe' })

      if (result.status === 0 && fs.existsSync(outputPath)) {
        thumbnails.push(outputPath)
      }
    } catch { /* ignore */ }
  }

  return thumbnails
}

function extractSceneFrames(
  videoPath: string, outputDir: string, videoId: string,
  numFrames: number, size: string, quality: number
): string[] {
  const thumbnails: string[] = []
  const tempPattern = path.join(outputDir, `${videoId}_scene_%03d.jpg`)
  const [width, height] = size.split('x')

  try {
    const maxScenes = numFrames * 3
    spawnSync('ffmpeg', [
      '-y', '-i', videoPath,
      '-vf', `select='gt(scene,0.3)',scale=${width}:${height}:force_original_aspect_ratio=decrease`,
      '-vsync', 'vfr', '-frames:v', maxScenes.toString(),
      '-q:v', quality.toString(), tempPattern,
    ], { encoding: 'utf-8', stdio: 'pipe' })

    const files = fs.readdirSync(outputDir)
      .filter(f => f.startsWith(`${videoId}_scene_`))
      .sort()

    if (files.length > 0) {
      const step = Math.max(1, Math.floor(files.length / numFrames))
      let count = 0
      for (let i = 0; i < files.length && count < numFrames; i += step) {
        const oldPath = path.join(outputDir, files[i])
        const newPath = path.join(outputDir, `${videoId}_${count + 1}.jpg`)
        fs.renameSync(oldPath, newPath)
        thumbnails.push(newPath)
        count++
      }
      for (const file of files) {
        const filePath = path.join(outputDir, file)
        if (fs.existsSync(filePath) && file.includes('_scene_')) {
          fs.unlinkSync(filePath)
        }
      }
    }
  } catch {
    console.log(`    ⚠ 장면 감지 실패, 균등 분할로 대체`)
  }

  return thumbnails
}

function main() {
  const options = parseArgs()

  console.log('='.repeat(50))
  console.log('🎬 Thumbnail Extraction')
  console.log('='.repeat(50))
  console.log(`카탈로그: ${options.catalogPath}`)
  console.log(`출력 디렉토리: ${options.outputDir}`)
  console.log(`프레임 수: ${options.framesPerVideo}`)
  console.log(`크기: ${options.size}`)
  console.log(`모드: ${options.mode}`)
  console.log('')

  if (!fs.existsSync(options.catalogPath)) {
    console.error(`❌ 카탈로그 파일이 없습니다: ${options.catalogPath}`)
    console.error('먼저 scan-media.ts를 실행하세요.')
    process.exit(1)
  }

  const catalog: MediaItem[] = JSON.parse(fs.readFileSync(options.catalogPath, 'utf-8'))
  let videos = catalog.filter(item => item.mediaType === 'video')

  console.log(`📹 비디오 파일: ${videos.length}개`)

  if (options.limit) {
    videos = videos.slice(0, options.limit)
    console.log(`⚠ 제한 적용: ${options.limit}개만 처리`)
  }

  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true })
  }

  console.log('\n추출 시작...\n')

  const startTime = Date.now()
  let processed = 0
  let skipped = 0
  let failed = 0
  const thumbnailMap: Record<string, string[]> = {}

  for (const video of videos) {
    const videoId = video.id

    const existingThumbs = fs.readdirSync(options.outputDir)
      .filter(f => f.startsWith(`${videoId}_`) && f.endsWith('.jpg'))

    if (existingThumbs.length >= options.framesPerVideo && !options.force) {
      thumbnailMap[videoId] = existingThumbs.map(f => path.join(options.outputDir, f))
      skipped++
      process.stdout.write('.')
      continue
    }

    if (!fs.existsSync(video.filePath)) {
      console.log(`  ⚠ 파일 없음: ${video.fileName}`)
      failed++
      continue
    }

    const duration = video.duration || getVideoDuration(video.filePath)
    if (!duration || duration < 1) {
      console.log(`  ⚠ 재생 시간 없음: ${video.fileName}`)
      failed++
      continue
    }

    let thumbnails: string[]

    if (options.mode === 'scene') {
      thumbnails = extractSceneFrames(
        video.filePath, options.outputDir, videoId,
        options.framesPerVideo, options.size, options.quality
      )
      if (thumbnails.length === 0) {
        thumbnails = extractEvenFrames(
          video.filePath, options.outputDir, videoId,
          options.framesPerVideo, options.size, options.quality, duration
        )
      }
    } else {
      thumbnails = extractEvenFrames(
        video.filePath, options.outputDir, videoId,
        options.framesPerVideo, options.size, options.quality, duration
      )
    }

    if (thumbnails.length > 0) {
      thumbnailMap[videoId] = thumbnails
      processed++
      console.log(`  ✓ ${video.fileName} (${thumbnails.length}장)`)
    } else {
      failed++
      console.log(`  ✗ ${video.fileName}`)
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  const mappingPath = path.join(options.outputDir, 'thumbnail-map.json')
  fs.writeFileSync(mappingPath, JSON.stringify(thumbnailMap, null, 2))

  console.log('\n' + '='.repeat(50))
  console.log(`✅ 추출 완료 (${elapsed}초)`)
  console.log('='.repeat(50))
  console.log(`처리됨: ${processed}개`)
  console.log(`스킵됨: ${skipped}개 (이미 존재)`)
  console.log(`실패: ${failed}개`)
  console.log(`\n썸네일 매핑: ${mappingPath}`)

  const totalThumbnails = Object.values(thumbnailMap).reduce((sum, arr) => sum + arr.length, 0)
  console.log(`총 썸네일: ${totalThumbnails}장`)
}

main()
