#!/usr/bin/env npx tsx
/**
 * Media Scanner Script (BrxceStudio 이식판)
 *
 * 미디어 디렉토리를 스캔하고 exiftool로 메타데이터를 추출하여
 * media-catalog.json에 저장합니다.
 *
 * 사용법:
 *   npx tsx scripts/scan-media.ts [options]
 *
 * 옵션:
 *   --root <path>     미디어 루트 경로 (기본: /Volumes/WorkSSD/Media)
 *   --output <path>   출력 JSON 경로 (기본: ./data/media-catalog.json)
 *   --dry-run         실제 저장 없이 스캔만 실행
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { createHash } from 'crypto'

const DEFAULT_MEDIA_ROOT = '/Volumes/WorkSSD/Media'
const DEFAULT_OUTPUT = './data/media-catalog.json'

type MediaType = 'video' | 'image' | 'audio'

interface ExifToolMetadata {
  FileName: string
  FileSize: string
  MIMEType: string
  Duration?: string | number
  ImageWidth?: number
  ImageHeight?: number
  VideoFrameRate?: number
  DateTimeOriginal?: string
  CreateDate?: string
  CaptureMode?: string
  Make?: string
  Model?: string
  GPSLatitude?: string
  GPSLongitude?: string
}

interface MediaItem {
  id: string
  filePath: string
  relativePath: string
  fileName: string
  fileSize: number
  mimeType: string
  mediaType: MediaType
  duration?: number
  width?: number
  height?: number
  captureDate?: string
  captureMode?: string
  frameRate?: number
  deviceMake?: string
  deviceModel?: string
  gps?: { latitude: number; longitude: number }
  fileModifiedAt: string
}

const MEDIA_EXTENSIONS: Record<MediaType, string[]> = {
  video: ['.mov', '.mp4', '.m4v', '.avi', '.mkv', '.webm', '.hevc'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.heic', '.heif', '.webp', '.tiff', '.raw', '.cr2', '.nef'],
  audio: ['.mp3', '.m4a', '.wav', '.aac', '.flac', '.ogg'],
}

function parseArgs() {
  const args = process.argv.slice(2)
  let root = DEFAULT_MEDIA_ROOT
  let output = DEFAULT_OUTPUT
  let dryRun = false

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--root' && args[i + 1]) {
      root = args[++i]
    } else if (args[i] === '--output' && args[i + 1]) {
      output = args[++i]
    } else if (args[i] === '--dry-run') {
      dryRun = true
    }
  }

  return { root, output, dryRun }
}

function generateId(filePath: string): string {
  return createHash('md5').update(filePath).digest('hex').substring(0, 8)
}

function getMediaType(fileName: string): MediaType | null {
  const ext = path.extname(fileName).toLowerCase()
  for (const [type, extensions] of Object.entries(MEDIA_EXTENSIONS)) {
    if (extensions.includes(ext)) return type as MediaType
  }
  return null
}

function extractMetadata(filePath: string): ExifToolMetadata | null {
  try {
    const cmd = `exiftool -json -q "${filePath}"`
    const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })
    const data = JSON.parse(output)
    return data[0] as ExifToolMetadata
  } catch {
    console.error(`  ⚠ 메타데이터 추출 실패: ${path.basename(filePath)}`)
    return null
  }
}

function parseDuration(duration: string | number | undefined): number | undefined {
  if (duration === undefined) return undefined
  if (typeof duration === 'number') return duration
  if (duration.includes(':')) {
    const parts = duration.split(':').map(Number)
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if (parts.length === 2) return parts[0] * 60 + parts[1]
  }
  const match = duration.match(/([\d.]+)\s*s/)
  if (match) return parseFloat(match[1])
  return undefined
}

function parseFileSize(sizeStr: string): number {
  const match = sizeStr.match(/([\d.]+)\s*(bytes|KB|MB|GB)/i)
  if (!match) return 0
  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()
  const multipliers: Record<string, number> = {
    BYTES: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024,
  }
  return Math.round(value * (multipliers[unit] || 1))
}

function parseGPS(
  lat: string | undefined,
  lon: string | undefined
): { latitude: number; longitude: number } | undefined {
  if (!lat || !lon) return undefined
  const parseDMS = (str: string): number | null => {
    const match = str.match(/([\d.]+)\s*deg\s*([\d.]+)'\s*([\d.]+)"\s*([NSEW])/i)
    if (!match) return null
    let decimal = parseFloat(match[1]) + parseFloat(match[2]) / 60 + parseFloat(match[3]) / 3600
    if (match[4].toUpperCase() === 'S' || match[4].toUpperCase() === 'W') decimal = -decimal
    return decimal
  }
  const latitude = parseDMS(lat)
  const longitude = parseDMS(lon)
  if (latitude !== null && longitude !== null) return { latitude, longitude }
  return undefined
}

function scanDirectory(dir: string, mediaRoot: string): MediaItem[] {
  const items: MediaItem[] = []

  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    console.error(`  ⚠ 디렉토리 읽기 실패: ${dir}`)
    return items
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      items.push(...scanDirectory(fullPath, mediaRoot))
    } else if (entry.isFile()) {
      const mediaType = getMediaType(entry.name)
      if (!mediaType) continue
      const relativePath = path.relative(mediaRoot, fullPath)
      const stat = fs.statSync(fullPath)
      const metadata = extractMetadata(fullPath)
      if (!metadata) continue

      items.push({
        id: generateId(fullPath),
        filePath: fullPath,
        relativePath,
        fileName: metadata.FileName,
        fileSize: parseFileSize(metadata.FileSize) || stat.size,
        mimeType: metadata.MIMEType || 'application/octet-stream',
        mediaType,
        duration: parseDuration(metadata.Duration),
        width: metadata.ImageWidth,
        height: metadata.ImageHeight,
        captureDate: metadata.DateTimeOriginal || metadata.CreateDate,
        captureMode: metadata.CaptureMode,
        frameRate: metadata.VideoFrameRate,
        deviceMake: metadata.Make,
        deviceModel: metadata.Model,
        gps: parseGPS(metadata.GPSLatitude, metadata.GPSLongitude),
        fileModifiedAt: stat.mtime.toISOString(),
      })
      console.log(`  ✓ ${entry.name}`)
    }
  }

  return items
}

function main() {
  const { root, output, dryRun } = parseArgs()

  console.log('='.repeat(50))
  console.log('📁 Media Catalog Scanner')
  console.log('='.repeat(50))
  console.log(`미디어 루트: ${root}`)
  console.log(`출력: ${output}`)
  console.log(`Dry run: ${dryRun ? '예' : '아니오'}`)
  console.log('')

  if (!fs.existsSync(root)) {
    console.error(`❌ 미디어 루트가 존재하지 않습니다: ${root}`)
    process.exit(1)
  }

  console.log('스캔 시작...\n')
  const startTime = Date.now()
  const items = scanDirectory(root, root)
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  const byType: Record<MediaType, number> = { video: 0, image: 0, audio: 0 }
  for (const item of items) byType[item.mediaType]++

  console.log('\n' + '='.repeat(50))
  console.log(`✅ 스캔 완료 (${elapsed}초)`)
  console.log('='.repeat(50))
  console.log(`총 파일: ${items.length}개`)
  console.log(`  - 비디오: ${byType.video}개`)
  console.log(`  - 이미지: ${byType.image}개`)
  console.log(`  - 오디오: ${byType.audio}개`)

  if (dryRun) {
    console.log('\n🔍 Dry run 모드 - 파일을 저장하지 않습니다.')
    return
  }

  const outputDir = path.dirname(output)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(output, JSON.stringify(items, null, 2))
  console.log(`\n📄 카탈로그 저장됨: ${output}`)
}

main()
