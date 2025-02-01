'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">エラーが発生しました</h2>
        <p className="text-muted-foreground">
          申し訳ありません。予期せぬエラーが発生しました。
        </p>
        {error.message && (
          <p className="text-sm text-red-500">
            エラー詳細: {error.message}
          </p>
        )}
        <div className="space-x-4">
          <Button onClick={() => reset()}>
            再試行
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            トップページに戻る
          </Button>
        </div>
      </div>
    </div>
  )
} 
