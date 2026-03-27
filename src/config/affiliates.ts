/**
 * アフィリエイト商品設定
 *
 * 使い方:
 * 1. Amazonアソシエイト（https://affiliate.amazon.co.jp/）に登録
 * 2. ASSOCIATE_TAG を自分のトラッキングIDに変更（例: "mokumoku-22"）
 * 3. 商品URLを実際の商品ページに変更（ASINでOK）
 *    例: https://www.amazon.co.jp/dp/ASIN?tag=YOUR_TAG
 */

const ASSOCIATE_TAG = import.meta.env.VITE_AMAZON_ASSOCIATE_TAG ?? 'your-tag-22'

function amzn(asin: string, keyword: string): string {
  // ASIN が設定されていれば商品直リンク、なければキーワード検索
  if (asin) {
    return `https://www.amazon.co.jp/dp/${asin}?tag=${ASSOCIATE_TAG}`
  }
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}&tag=${ASSOCIATE_TAG}`
}

export interface AffiliateProduct {
  emoji: string
  label: string
  url: string
}

/**
 * マイルストーン別おすすめ商品
 * ASIN欄を実際の商品ASINに差し替えるだけでOK
 * （Amazonの商品URLの /dp/XXXXXXXXXX の部分がASIN）
 */
export const AFFILIATE_BY_MILESTONE: Record<string, AffiliateProduct[]> = {
  // 30分達成
  '30min': [
    { emoji: '🎧', label: 'ノイキャンイヤホン', url: amzn('', 'ノイズキャンセリングイヤホン') },
    { emoji: '📓', label: '集中ノート', url: amzn('', 'コクヨ キャンパスノート') },
    { emoji: '🖊️', label: 'お気に入りペン', url: amzn('', 'ジェットストリーム ボールペン') },
  ],
  // 1時間達成
  '1h': [
    { emoji: '☕', label: '集中のお供コーヒー', url: amzn('', 'ドリップコーヒー おすすめ') },
    { emoji: '💻', label: 'PCスタンド', url: amzn('', 'ノートPC スタンド 折りたたみ') },
    { emoji: '🔆', label: 'デスクライト', url: amzn('', 'デスクライト LED 目に優しい') },
  ],
  // 1.5時間達成
  '1.5h': [
    { emoji: '🪑', label: '腰サポートクッション', url: amzn('', '腰痛 クッション 椅子') },
    { emoji: '🎵', label: 'ヘッドフォン', url: amzn('', 'ヘッドフォン 勉強 集中') },
  ],
  // 2時間達成
  '2h': [
    { emoji: '🧴', label: 'ハンドクリーム', url: amzn('', 'ハンドクリーム おすすめ') },
    { emoji: '🍵', label: '集中できるお茶', url: amzn('', '緑茶 テアニン 集中力') },
    { emoji: '📱', label: 'スマホスタンド', url: amzn('', 'スマホ スタンド デスク') },
  ],
  // 3時間達成
  '3h': [
    { emoji: '💪', label: 'ストレッチグッズ', url: amzn('', 'ストレッチ デスクワーク') },
    { emoji: '👓', label: 'ブルーライトカット眼鏡', url: amzn('', 'ブルーライト カット 眼鏡') },
  ],
}

/** マイルストーンmsからキーを返す */
export function getMilestoneKey(ms: number): string {
  const minutes = ms / 60000
  if (minutes === 30) return '30min'
  if (minutes === 60) return '1h'
  if (minutes === 90) return '1.5h'
  if (minutes === 120) return '2h'
  if (minutes === 180) return '3h'
  return ''
}

/** ランダムで1商品選ぶ */
export function pickProduct(key: string): AffiliateProduct | null {
  const list = AFFILIATE_BY_MILESTONE[key]
  if (!list || list.length === 0) return null
  return list[Math.floor(Math.random() * list.length)]
}
