export type ProjectType = 'video' | 'carousel' | 'image'

export type ProjectStatus = 'draft' | 'editing' | 'ready' | 'rendering' | 'rendered' | 'failed'

export interface StudioProject {
  id: string
  content_id: string | null
  title: string
  type: ProjectType
  status: ProjectStatus
  template: string
  width: number
  height: number
  fps: number | null
  scenes: unknown[]
  media_mappings: Record<string, unknown>
  style_config: Record<string, unknown>
  output_urls: string[]
  render_log: string | null
  created_at: string
  updated_at: string
}
