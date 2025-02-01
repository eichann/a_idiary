"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { Diary, moodEmojis } from "@/types/diary"

export function DiaryList() {
  const router = useRouter()
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("ユーザーが見つかりません")

        const { data, error } = await supabase
          .from('diaries')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setDiaries(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "日記の取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    fetchDiaries()
  }, [])

  if (loading) return <div>読み込み中...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (diaries.length === 0) return <div>まだ日記がありません</div>

  return (
    <div className="space-y-4">
      {diaries.map((diary) => (
        <Card 
          key={diary.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push(`/diary/${diary.id}`)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm text-muted-foreground">
              {new Date(diary.created_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-2xl" title={diary.mood}>
              {moodEmojis[diary.mood]}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm line-clamp-3">{diary.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 
