/**
 * Template → Primitive Mapping
 *
 * Documents which slide primitives each of the 19 templates would use.
 * Serves as a verification reference for Phase 3 refactoring.
 */

export const TEMPLATE_PRIMITIVE_MAP: Record<string, string[]> = {
  // --- Covers ---
  'CoverBold': ['Overline', 'SlideTitle', 'AccentBar', 'MutedText'],
  'CoverCentered': ['Overline', 'SlideTitle', 'AccentBar', 'MutedText'],
  'CoverGradient': ['SlideTitle', 'MutedText'],
  'CoverMinimal': ['SlideTitle', 'AccentBar', 'MutedText'],
  'CoverSplit': ['SlideTitle', 'AccentBar', 'MutedText'],

  // --- Hooks ---
  'HookProblem': ['SlideTitle', 'BulletList'],
  'HookQuestion': ['SlideTitle', 'MutedText'],
  'HookStat': ['Overline', 'StatDisplay', 'AccentBar', 'MutedText'],
  'HookTeaser': ['Overline', 'SlideTitle', 'MutedText'],

  // --- Body ---
  'BodyCompare': ['SlideTitle', 'SlideCard', 'BulletList'],
  'BodyDiagram': ['SlideTitle', 'DiagramFlow'],
  'BodyList': ['SlideTitle', 'AccentBar', 'NumberBadge', 'SlideCard', 'MutedText'],
  'BodyQuote': ['SlideCard', 'QuoteBlock'],
  'BodyStep': ['SlideTitle', 'AccentBar', 'NumberBadge', 'SlideCard', 'MutedText'],
  'BodyText': ['SlideTitle', 'AccentBar', 'MutedText'],

  // --- CTAs ---
  'CTAFollow': ['SlideTitle', 'CTAButton', 'MutedText'],
  'CTALink': ['Overline', 'SlideTitle', 'LinkBox', 'MutedText'],
  'CTAQuestion': ['SlideTitle', 'MutedText'],
  'CTASave': ['SlideTitle', 'MutedText'],
} as const

/** All primitive component names */
export const ALL_PRIMITIVES = [
  'SlideTitle',
  'AccentBar',
  'NumberBadge',
  'SlideCard',
  'BulletList',
  'CTAButton',
  'QuoteBlock',
  'DiagramFlow',
  'Overline',
  'LinkBox',
  'StatDisplay',
  'MutedText',
] as const

/** Verify every primitive is used by at least one template */
export function getUnusedPrimitives(): string[] {
  const used = new Set(Object.values(TEMPLATE_PRIMITIVE_MAP).flat())
  return ALL_PRIMITIVES.filter((p) => !used.has(p))
}

/** Get all templates that use a specific primitive */
export function getTemplatesUsing(primitive: string): string[] {
  return Object.entries(TEMPLATE_PRIMITIVE_MAP)
    .filter(([, primitives]) => primitives.includes(primitive))
    .map(([template]) => template)
}
