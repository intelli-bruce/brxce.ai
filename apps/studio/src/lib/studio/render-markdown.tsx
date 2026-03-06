import type { ReactNode } from 'react'
import { fontWeight } from './slide-tokens'

/**
 * Parse **bold** markdown in text and return React nodes.
 * Used across slide templates for both title and body fields.
 */
export function renderMarkdownBold(text: string, accentColor?: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={`b-${idx}`} style={{ fontWeight: fontWeight.bold, color: accentColor }}>
          {part.slice(2, -2)}
        </span>
      )
    }
    return <span key={`t-${idx}`}>{part}</span>
  })
}
