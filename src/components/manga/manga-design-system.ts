// src/components/manga/manga-design-system.ts

export type CharacterMood =
  | 'neutral' | 'pleased' | 'strict'
  | 'surprised' | 'thinking' | 'disappointed';

export type CharacterType =
  | 'technical'   // 技術部長・CTO → 技術問題
  | 'hr'          // 人力資源・人事 → カルチャー・志望動機
  | 'pm'          // プロジェクトマネージャー → プロセス・経験
  | 'pmo'         // PMO → ガバナンス・組織・リスク
  | 'executive';  // 役員 → ビジョン・リーダーシップ

export type BubbleType = 'speech' | 'thought' | 'shout' | 'narration' | 'sfx';

export type Gender = 'male' | 'female';

// 问题标签 → 负责角色映射
export type QuestionCategory =
  | 'technical'     // 技術問題
  | 'algorithm'     // アルゴリズム
  | 'system_design' // システム設計
  | 'culture'       // カルチャーフィット
  | 'motivation'    // 志望動機
  | 'self_pr'       // 自己PR
  | 'teamwork'      // チームワーク
  | 'process'       // 開発プロセス
  | 'agile'         // アジャイル・スクラム
  | 'planning'      // 計画・見積もり
  | 'governance'    // ガバナンス
  | 'risk'          // リスク管理
  | 'compliance'    // コンプライアンス
  | 'vision'        // ビジョン・戦略
  | 'leadership';   // リーダーシップ

export interface Character {
  id: string;
  name: string;
  nameJa: string;
  role: string;
  type: CharacterType;
  gender: Gender;
  personality: string;
  animeStyle?: boolean; // true = anime SVG rendering
  questionCategories: QuestionCategory[]; // 此角色负责的问题类型
  colors: {
    skin: string;
    hair: string;
    eyeColor?: string;   // iris color (anime characters)
    // 男性专用
    suit?: string;
    tie?: string;
    glasses?: string;
    // 女性专用
    jacket?: string;
    blouse?: string;
    hairStyle?: 'short' | 'medium' | 'long' | 'bun' | 'twintails' | 'spiky' | 'flowing'; // 发型
    accessory?: 'earrings' | 'necklace' | 'none';
  };
  greetings: string[];
  reactions: Record<CharacterMood, string[]>;
}

// ─────────────────────────────────────────
// 全角色定义（9名：6名職場系 + 3名アニメ系）
// ─────────────────────────────────────────
export const CHARACTERS: Record<string, Character> = {

  // ── 男性1：技術部長（既有，保留）─────────────
  tanaka: {
    id: 'tanaka',
    name: '田中部長',
    nameJa: '田中 誠一',
    role: '技術部長',
    type: 'technical',
    gender: 'male',
    personality: '厳格・論理重視',
    questionCategories: ['technical', 'algorithm', 'system_design'],
    colors: {
      skin: '#FDBCB4', hair: '#2C2C2C',
      suit: '#1E2A4A', tie: '#C0392B', glasses: '#333333',
    },
    greetings: [
      'では、技術的な質問から始めましょう。',
      'よろしく。早速本題に入りましょう。',
      '今日は実力を見せてもらいます。',
    ],
    reactions: {
      neutral:      ['なるほど。', '続けてください。', 'ふむ。'],
      pleased:      ['良い回答ですね。', 'その通りです。', '素晴らしい。'],
      strict:       ['もっと具体的に。', '根拠は？', '浅いですね。'],
      surprised:    ['ほう、それは…', '予想外の視点ですね。', 'なかなか。'],
      thinking:     ['…', '少し考えます。', 'それは…'],
      disappointed: ['期待していたのですが。', '準備不足ですね。', 'もう一度考えて。'],
    },
  },

  // ── 男性2：CTO（既有，保留）─────────────────
  suzuki: {
    id: 'suzuki',
    name: '鈴木CTO',
    nameJa: '鈴木 大輔',
    role: 'CTO',
    type: 'executive',
    gender: 'male',
    personality: '鋭い・ビジョン重視',
    questionCategories: ['vision', 'leadership', 'system_design'],
    colors: {
      skin: '#F5C5A3', hair: '#1A1A1A',
      suit: '#0D1B2A', tie: '#2D5BE3',
    },
    greetings: [
      '時間は貴重です。本質だけ話しましょう。',
      '君がうちに来る理由を教えてください。',
      '技術的な議論を期待しています。',
    ],
    reactions: {
      neutral:      ['続けて。', 'それで？', 'もう一つ聞きます。'],
      pleased:      ['面白い。', 'その視点は良い。', '採用したいですね。'],
      strict:       ['なぜ？', '数字は？', 'もっと本質を。'],
      surprised:    ['それは考えたことなかった。', '鋭い指摘ですね。', 'ほう。'],
      thinking:     ['…考えています。', 'なるほど。', 'ふむ。'],
      disappointed: ['期待外れです。', 'もっと深く考えて。', '準備不足ですね。'],
    },
  },

  // ── 女性1：人力資源 HR ───────────────────────
  yamamoto: {
    id: 'yamamoto',
    name: '山本さん',
    nameJa: '山本 花子',
    role: '人力資源担当',
    type: 'hr',
    gender: 'female',
    personality: '親切・人物重視',
    questionCategories: ['culture', 'motivation', 'self_pr'],
    colors: {
      skin: '#FDBCB4', hair: '#6B3A2A',
      jacket: '#4A235A', blouse: '#F8E8F5',
      hairStyle: 'medium', accessory: 'earrings',
    },
    greetings: [
      'はじめまして！今日はリラックスして話しましょう。',
      'どうぞ、緊張せずに。あなたのことを聞かせてください。',
      'よろしくお願いします！楽しみにしていました。',
    ],
    reactions: {
      neutral:      ['なるほどですね。', 'そうなんですね。', 'ありがとうございます。'],
      pleased:      ['素晴らしいですね！', 'とても共感できます！', 'ぜひ一緒に働きたいです！'],
      strict:       ['もう少し詳しく？', 'チームとの関係は？', 'その点はどうですか？'],
      surprised:    ['えっ、本当に？', 'それは初めて聞きました！', 'なんと！'],
      thinking:     ['うーん…', '少し考えさせてください。', 'なるほどなるほど。'],
      disappointed: ['残念ですが…', 'もう少し準備できたかも。', '次は頑張ってください。'],
    },
  },

  // ── 女性2：人事担当 ──────────────────────────
  sato: {
    id: 'sato',
    name: '佐藤さん',
    nameJa: '佐藤 美咲',
    role: '人事担当',
    type: 'hr',
    gender: 'female',
    personality: '穏やか・チーム重視',
    questionCategories: ['teamwork', 'self_pr', 'culture'],
    colors: {
      skin: '#FCCFB0', hair: '#2C1810',
      jacket: '#1A4A3A', blouse: '#FFFFFF',
      hairStyle: 'bun', accessory: 'necklace',
    },
    greetings: [
      'よろしくお願いします。ゆっくり話しましょう。',
      'はじめまして。今日はよろしくお願いいたします。',
      '緊張しなくて大丈夫ですよ。普通に話してください。',
    ],
    reactions: {
      neutral:      ['なるほど。', 'そうですか。', '続けてください。'],
      pleased:      ['とても良いですね。', 'チームに合いそうです！', 'すてきなエピソードですね。'],
      strict:       ['もう少し具体的に？', '周りの人はどう思いましたか？', 'その時どう対処しましたか？'],
      surprised:    ['そうだったんですね！', '初めて聞きました。', 'へえ、それは…'],
      thinking:     ['そうですねえ…', 'うーん。', '少し整理しますね。'],
      disappointed: ['そうですか…', '難しいですね。', 'もう少し考えてみてください。'],
    },
  },

  // ── 女性3：プロジェクトマネージャー ────────────
  nakamura: {
    id: 'nakamura',
    name: '中村PM',
    nameJa: '中村 理恵',
    role: 'プロジェクトマネージャー',
    type: 'pm',
    gender: 'female',
    personality: '実践的・プロセス重視',
    questionCategories: ['process', 'agile', 'planning', 'teamwork'],
    colors: {
      skin: '#FDBCB4', hair: '#1C1C1C',
      jacket: '#2C3E50', blouse: '#D5E8F5',
      hairStyle: 'short', accessory: 'none',
    },
    greetings: [
      'よろしくお願いします。実際の経験を聞かせてください。',
      'では早速、プロジェクト管理についてお聞きします。',
      '具体的なエピソードで話してもらえると助かります。',
    ],
    reactions: {
      neutral:      ['なるほど。', 'それで結果は？', '続けてください。'],
      pleased:      ['完璧なアプローチですね。', 'それは理想的です！', 'まさに求めていた答えです。'],
      strict:       ['KPIは？', 'スケジュールはどうでしたか？', 'リスクはどう対処しましたか？'],
      surprised:    ['それは大変でしたね。', 'その判断は難しかったはずです。', 'なるほど、その方法で。'],
      thinking:     ['ふむ…', 'プロセスとして…', '少し整理しますね。'],
      disappointed: ['具体性が足りませんね。', '数字で話してもらえますか？', '経験が浅い印象です。'],
    },
  },

  // ── アニメ男性1：シニアエンジニア（銀髪スパイキー）───────────────
  kiryu: {
    id: 'kiryu',
    name: '桐生先輩',
    nameJa: '桐生 ケン',
    role: 'シニアエンジニア',
    type: 'technical',
    gender: 'male',
    animeStyle: true,
    personality: 'クール系だが実はいい奴・技術愛好家',
    questionCategories: ['technical', 'algorithm'],
    colors: {
      skin: '#FDCFB8', hair: '#C8C8C8',
      eyeColor: '#3A6A9A',
      suit: '#0D1B2A', tie: '#00B4D8',
    },
    greetings: [
      '俺は桐生。よろしくな。技術で勝負しようぜ。',
      '面接? いや、技術トークだと思ってくれ。楽しもう。',
      'よぉ、準備はいいか？一緒に最高の問題に挑戦しようぜ。',
    ],
    reactions: {
      neutral:      ['いいテンポだ。', '聞いてるぞ。', '続けてくれ。'],
      pleased:      ['…おっ、いいじゃないか。', 'その考え方、俺好きだぜ。', 'こりゃあ期待できるな。'],
      strict:       ['甘いな。もう一段階先を考えてくれ。', '根拠は？具体的に説明してみ。', '本質をつかんでないな。'],
      surprised:    ['…っ！それはいい視点だ！', 'へえ、そこに気づいたか。やるな。', 'マジか。考えもしなかった。'],
      thinking:     ['ふむ…なるほどな。', '…いい問題を投げてきやがったな。', 'うっし、計算してみるか。'],
      disappointed: ['うーん…ちょい甘かったな。', '実務経験、もう少し積めばいいと思うぜ。', '次はもっと深く考えてこいよ。'],
    },
  },

  // ── アニメ女性1：HR担当（青いツインテール）──────────────────────
  aoi: {
    id: 'aoi',
    name: '蒼井さん',
    nameJa: '蒼井 アオイ',
    role: '人事担当（新卒採用）',
    type: 'hr',
    gender: 'female',
    animeStyle: true,
    personality: '元気でキュート・でも鋭い観察眼あり',
    questionCategories: ['culture', 'motivation', 'teamwork'],
    colors: {
      skin: '#FDDBD0', hair: '#1E8FE8',
      eyeColor: '#0A7ADB',
      jacket: '#8B5CF6', blouse: '#FFFFFF',
      hairStyle: 'twintails', accessory: 'none',
    },
    greetings: [
      'こんにちは！蒼井アオイです〜♪ 楽しく話しましょう！',
      'わあ！やっと会えた。一緒に最高のチームを作ろうね！',
      '大丈夫ですよ〜。むしろ素の状態の君が知りたいんです！',
    ],
    reactions: {
      neutral:      ['うんうん、聞いてますよ！', 'へえ、そうなんですね。', 'いい表情で話すなあ。'],
      pleased:      ['わあ、素敵〜！😊', 'この人とはいい関係作れそう！', 'うちのチームに欲しいタイプだ！'],
      strict:       ['ちょっと待ってください。もっと詳しく？', 'その時、周りの人はどう思いました？', 'それって本当の気持ちですか？'],
      surprised:    ['えっ、本当に！？', 'わあ、初耳です！', 'その発想、いいですね！'],
      thinking:     ['んー…ちょっと考えますね。', 'うーん…そっか…', 'なるほど、興味深い。'],
      disappointed: ['あ…残念。', 'もう一息だったのに…。', '次、頑張ってくださいね！応援してます。'],
    },
  },

  // ── アニメ女性2：事業開発部長（ダークレッドの流れる髪）──────────
  rei: {
    id: 'rei',
    name: '零部長',
    nameJa: '零 レイ',
    role: '事業開発部長',
    type: 'executive',
    gender: 'female',
    animeStyle: true,
    personality: 'クールビューティ・でも心優しい・ビジョナリー',
    questionCategories: ['vision', 'leadership', 'risk'],
    colors: {
      skin: '#F8C8A8', hair: '#8B1A1A',
      eyeColor: '#6B1A1A',
      jacket: '#1A1A1A', blouse: '#4A0A0A',
      hairStyle: 'flowing', accessory: 'earrings',
    },
    greetings: [
      '零レイです。あなたのビジョンを聞かせてもらいましょうか。',
      'リーダーシップについてのあなたの考え、興味深いですね。',
      '5年後、10年後、どんな世界を見ていますか？聞きたいです。',
    ],
    reactions: {
      neutral:      ['なるほど…興味深い。', 'その視点は持っていなかった。', '説明、ありがとう。'],
      pleased:      ['…いい。それだ。', 'その戦略、うちに必要だ。', 'あなたと一緒に何かやりたい。'],
      strict:       ['なぜそこに気づかない？', 'リスクは？市場は？', 'もっと高く見てください。'],
      surprised:    ['…！', 'それはいい着眼点だ。', 'ふむ、あなたは違うな。'],
      thinking:     ['…戦略的に考えると…', 'その視点から見ると…', '…いい質問をもらった。'],
      disappointed: ['…期待していた。', 'もう一段階上を目指してください。', 'でも次があります。'],
    },
  },

  // ── 女性4：PMO ───────────────────────────────
  kobayashi: {
    id: 'kobayashi',
    name: '小林PMO',
    nameJa: '小林 優子',
    role: 'PMO責任者',
    type: 'pmo',
    gender: 'female',
    personality: '厳密・ガバナンス重視',
    questionCategories: ['governance', 'risk', 'compliance', 'planning'],
    colors: {
      skin: '#F5C5A3', hair: '#2A1A0A',
      jacket: '#3D1A4A', blouse: '#F0E8FF',
      hairStyle: 'long', accessory: 'earrings',
    },
    greetings: [
      'よろしくお願いします。ガバナンスの観点から伺います。',
      'コンプライアンスと品質管理について確認させてください。',
      '組織とプロセスについて詳しく聞かせてください。',
    ],
    reactions: {
      neutral:      ['なるほど。', '記録しました。', '続けてください。'],
      pleased:      ['規範に沿っていますね。', '理想的なアプローチです。', 'コンプライアンス的に完璧です。'],
      strict:       ['文書化は？', '承認プロセスは？', '例外対応はどうしますか？'],
      surprised:    ['それは…想定外ですね。', 'リスクとして認識していましたか？', 'そのケースは珍しい。'],
      thinking:     ['規程を確認すると…', 'ガバナンス上は…', 'うーん、難しいケースですね。'],
      disappointed: ['規律が足りません。', 'プロセスを軽視していますね。', 'もっと体系的に考えてください。'],
    },
  },
};

// ─────────────────────────────────────────
// 问题分类 → 角色映射表
// ─────────────────────────────────────────
export const CATEGORY_TO_CHARACTER: Record<QuestionCategory, string> = {
  technical:     'kiryu',      // アニメ：シニアエンジニア
  algorithm:     'tanaka',     // 職場：技術部長
  system_design: 'suzuki',     // 職場：CTO
  culture:       'aoi',        // アニメ：HR担当
  motivation:    'aoi',        // アニメ：HR担当
  self_pr:       'sato',       // 職場：人事
  teamwork:      'aoi',        // アニメ：HR担当
  process:       'nakamura',   // 職場：PM
  agile:         'nakamura',   // 職場：PM
  planning:      'kobayashi',  // 職場：PMO
  governance:    'kobayashi',  // 職場：PMO
  risk:          'rei',        // アニメ：事業部長
  compliance:    'kobayashi',  // 職場：PMO
  vision:        'rei',        // アニメ：事業部長
  leadership:    'rei',        // アニメ：事業部長
};

// 根据问题类别获取负责角色ID
export function getCharacterByCategory(category: QuestionCategory): string {
  return CATEGORY_TO_CHARACTER[category] ?? 'tanaka';
}

// 根据角色类型获取该类型所有角色
export function getCharactersByType(type: CharacterType): Character[] {
  return Object.values(CHARACTERS).filter(c => c.type === type);
}

// ─────────────────────────────────────────
// 漫画元素样式常量
// ─────────────────────────────────────────
export const MANGA_STYLES = {
  bubble: {
    speech: {
      background: '#FFFFFF',
      border: '2px solid #1A1A1A',
      borderRadius: '12px 12px 12px 4px',
      padding: '10px 14px',
      fontSize: '13px',
      lineHeight: '1.6',
    },
    speechRight: {
      background: '#FFFEF0',
      border: '2px solid #1A1A1A',
      borderRadius: '12px 12px 4px 12px',
      padding: '10px 14px',
      fontSize: '13px',
      lineHeight: '1.6',
    },
    narration: {
      background: '#FFFFF0',
      border: '2px solid #888888',
      borderRadius: '4px',
      padding: '8px 12px',
      fontSize: '11px',
      fontStyle: 'italic',
      color: '#333333',
    },
  },
  sfx: {
    question:  { text: '？',  color: '#2D5BE3', opacity: 0.12, fontSize: '64px' },
    correct:   { text: '◎',  color: '#27AE60', opacity: 0.15, fontSize: '72px' },
    wrong:     { text: '✕',  color: '#E74C3C', opacity: 0.12, fontSize: '72px' },
    thinking:  { text: '…',  color: '#888888', opacity: 0.18, fontSize: '48px' },
    shock:     { text: '!!', color: '#F0C93A', opacity: 0.20, fontSize: '56px' },
    excellent: { text: '★',  color: '#2D5BE3', opacity: 0.10, fontSize: '80px' },
  },
  stamp: {
    pass:      { color: '#2D5BE3', border: '3px solid #2D5BE3', transform: 'rotate(-3deg)' },
    fail:      { color: '#E74C3C', border: '3px solid #E74C3C', transform: 'rotate(-2deg)' },
    pending:   { color: '#C89B00', border: '3px solid #F0C93A', transform: 'rotate(-1deg)' },
    excellent: { color: '#1A8A3C', border: '3px solid #27AE60', transform: 'rotate(-4deg)' },
  },
};

export const SCORE_THRESHOLDS = { excellent: 85, pass: 65, borderline: 50 };

export function getStampByScore(score: number): keyof typeof MANGA_STYLES.stamp {
  if (score >= SCORE_THRESHOLDS.excellent) return 'excellent';
  if (score >= SCORE_THRESHOLDS.pass)      return 'pass';
  if (score >= SCORE_THRESHOLDS.borderline) return 'pending';
  return 'fail';
}

export function getStampLabel(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return '優秀';
  if (score >= SCORE_THRESHOLDS.pass)      return '合格圏内';
  if (score >= SCORE_THRESHOLDS.borderline) return '要改善';
  return '不合格';
}

// 问题标签多语言显示
export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  technical:     '技術問題',
  algorithm:     'アルゴリズム',
  system_design: 'システム設計',
  culture:       'カルチャーフィット',
  motivation:    '志望動機',
  self_pr:       '自己PR',
  teamwork:      'チームワーク',
  process:       '開発プロセス',
  agile:         'アジャイル',
  planning:      '計画・見積もり',
  governance:    'ガバナンス',
  risk:          'リスク管理',
  compliance:    'コンプライアンス',
  vision:        'ビジョン・戦略',
  leadership:    'リーダーシップ',
};
