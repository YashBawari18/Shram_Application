import { Skill } from '../types/app'

export interface SkillMeta {
  key: Skill
  label_en: string
  label_hi: string
  label_mr: string
  emoji: string
}

export const SKILLS: SkillMeta[] = [
  { key: 'painter',              label_en: 'Painter',             label_hi: 'पेंटर',          label_mr: 'पेंटर',        emoji: '🖌️' },
  { key: 'helper',               label_en: 'Helper',              label_hi: 'हेल्पर',          label_mr: 'मदतनीस',       emoji: '🧱' },
  { key: 'mason',                label_en: 'Mason',               label_hi: 'राज मिस्त्री',    label_mr: 'गवंडी',        emoji: '🏗️' },
  { key: 'electrician',          label_en: 'Electrician',         label_hi: 'इलेक्ट्रिशियन',  label_mr: 'विद्युत कारागीर', emoji: '⚡' },
  { key: 'plumber',              label_en: 'Plumber',             label_hi: 'प्लम्बर',         label_mr: 'प्लंबर',       emoji: '🔧' },
  { key: 'carpenter',            label_en: 'Carpenter',           label_hi: 'बढ़ई',            label_mr: 'सुतार',        emoji: '🪚' },
  { key: 'tile_worker',          label_en: 'Tile Worker',         label_hi: 'टाइल मिस्त्री',  label_mr: 'टाइल कारागीर', emoji: '🪟' },
  { key: 'welder',               label_en: 'Welder',              label_hi: 'वेल्डर',          label_mr: 'वेल्डर',       emoji: '🔩' },
  { key: 'construction_laborer', label_en: 'Construction Labour', label_hi: 'कंस्ट्रक्शन मज़दूर', label_mr: 'बांधकाम मजूर', emoji: '⛏️' },
]

export const SKILL_MAP = Object.fromEntries(SKILLS.map(s => [s.key, s])) as Record<Skill, SkillMeta>

export function getSkillLabel(skill: Skill, lang: 'en' | 'hi' | 'mr' = 'hi'): string {
  const meta = SKILL_MAP[skill]
  if (!meta) return skill
  return lang === 'hi' ? meta.label_hi : lang === 'mr' ? meta.label_mr : meta.label_en
}
