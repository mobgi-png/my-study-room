import { useEffect, useRef } from 'react'

interface Props {
  slot: string          // AdSenseの広告ユニットID
  format?: 'auto' | 'rectangle'
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

let scriptLoaded = false

function loadAdSenseScript(publisherId: string) {
  if (scriptLoaded) return
  scriptLoaded = true
  const script = document.createElement('script')
  script.async = true
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}

/**
 * Google AdSense バナー
 *
 * 設定手順:
 * 1. https://adsense.google.com/ でアカウント作成・審査通過
 * 2. 広告ユニットを作成し、publisher ID（ca-pub-XXXX）と slot ID を取得
 * 3. .env.local に追加:
 *      VITE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
 *      VITE_ADSENSE_SLOT_SIDEBAR=XXXXXXXXXX
 * 4. Vercel環境変数にも同じ値を設定して再デプロイ
 */
export default function AdBanner({ slot, format = 'auto', className = '' }: Props) {
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID
  const initialized = useRef(false)

  useEffect(() => {
    if (!publisherId || publisherId.includes('YOUR_PUBLISHER_ID')) return
    loadAdSenseScript(publisherId)

    if (initialized.current) return
    initialized.current = true

    // スクリプトロード後に少し待ってから初期化
    const timer = setTimeout(() => {
      try {
        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
      } catch { /* ブロック時は無視 */ }
    }, 100)

    return () => clearTimeout(timer)
  }, [publisherId])

  if (!publisherId || publisherId.includes('YOUR_PUBLISHER_ID')) return null

  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
