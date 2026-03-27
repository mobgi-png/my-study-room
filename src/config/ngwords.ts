// ニックネームに使用できない語句リスト
// 誹謗中傷・不適切な表現・なりすましを防ぐ
const NG_WORDS = [
  // 管理者なりすまし
  '管理者', '運営', 'admin', 'administrator', 'moderator', 'mod',
  // 基本的な差別・侮辱語（代表的なもの）
  'うんこ', 'ちんこ', 'まんこ', 'きもい', 'きもち', 'ブス', 'デブ', 'ハゲ',
  'バカ', '馬鹿', 'アホ', '死ね', '殺す', 'クズ', 'ゴミ', 'カス',
  'nigger', 'faggot', 'bitch', 'asshole',
]

/**
 * ニックネームにNGワードが含まれているか確認する
 * @returns NGワードが含まれていた場合 true
 */
export function containsNgWord(name: string): boolean {
  const lower = name.toLowerCase()
  return NG_WORDS.some((w) => lower.includes(w.toLowerCase()))
}
