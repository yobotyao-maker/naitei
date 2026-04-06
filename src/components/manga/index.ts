// src/components/manga/index.ts
export { CharacterSVG } from './CharacterSVG';
export { SpeechBubble } from './SpeechBubble';
export { MangaGrid, MangaPanel, SFXBackground, NarrationBox, ResultStamp } from './MangaPanel';
export { MangaOpening, MangaQuestion, MangaResult } from './MangaInterview';
export {
  CHARACTERS,
  MANGA_STYLES,
  SCORE_THRESHOLDS,
  getStampByScore,
  getStampLabel,
} from './manga-design-system';
export type { Character, CharacterMood, CharacterType, BubbleType, QuestionCategory } from './manga-design-system';
export { CharacterRoster } from './CharacterRoster';
export { CATEGORY_LABELS, CATEGORY_TO_CHARACTER, getCharactersByType } from './manga-design-system';
