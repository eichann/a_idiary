"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { Diary, moodEmojis } from "@/types/diary"
import { AIComment } from "@/types/ai"
import { generateAIComments } from "@/lib/ai"
import { use } from "react"

export default function DiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const unwrappedParams = use(params)
  const [diary, setDiary] = useState<Diary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aiComments, setAiComments] = useState<AIComment[]>([])
  const [isRequestingComments, setIsRequestingComments] = useState(false)

  // 日記とAIコメントを取得
  useEffect(() => {
    const fetchDiaryAndComments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("ユーザーが見つかりません")

        // 日記を取得
        const { data: diaryData, error: diaryError } = await supabase
          .from('diaries')
          .select('*')
          .eq('id', unwrappedParams.id)
          .single()

        if (diaryError) throw diaryError
        if (!diaryData) throw new Error("日記が見つかりません")
        
        setDiary(diaryData)

        // AIコメントを取得
        const { data: commentsData, error: commentsError } = await supabase
          .from('ai_comments')
          .select('*')
          .eq('diary_id', unwrappedParams.id)
          .order('created_at', { ascending: true })

        if (commentsError) throw commentsError
        
        if (commentsData) {
          setAiComments(commentsData.map(comment => ({
            id: comment.id,
            name: comment.ai_name,
            avatar: comment.ai_avatar,
            role: comment.ai_role,
            comment: comment.comment
          })))
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "データの取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    fetchDiaryAndComments()
  }, [unwrappedParams.id])

  const handleRequestComments = async () => {
    if (!diary) return

    setIsRequestingComments(true)
    try {
      // AIコメントを生成
      const comments = await generateAIComments(diary.content)
      
      // AIコメントをデータベースに保存
      const { error: insertError } = await supabase
        .from('ai_comments')
        .insert(
          comments.map(comment => ({
            diary_id: diary.id,
            ai_name: comment.name,
            ai_avatar: comment.avatar,
            ai_role: comment.role,
            comment: comment.comment
          }))
        )

      if (insertError) throw insertError

      // AIレビューステータスを更新
      const { error: updateError } = await supabase
        .from('diaries')
        .update({ ai_review_status: 'completed' })
        .eq('id', diary.id)

      if (updateError) throw updateError

      // 状態を更新
      setAiComments(comments)
      setDiary(prev => prev ? { ...prev, ai_review_status: 'completed' } : null)
    } catch (error) {
      console.error('Error generating AI comments:', error)
      setError(error instanceof Error ? error.message : "AIコメントの生成に失敗しました")
    } finally {
      setIsRequestingComments(false)
    }
  }

  if (loading) return <div className="container mx-auto py-8">読み込み中...</div>
  if (error) return <div className="container mx-auto py-8 text-red-500">{error}</div>
  if (!diary) return <div className="container mx-auto py-8">日記が見つかりません</div>

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-4"
      >
        ← 戻る
      </Button>
      
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {new Date(diary.created_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}の日記
            </h1>
            <div className="text-sm text-muted-foreground">
              {new Date(diary.created_at).toLocaleTimeString('ja-JP')}
            </div>
          </div>
          <div className="text-4xl" title={diary.mood}>
            {moodEmojis[diary.mood]}
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{diary.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            AIレビューステータス: {diary.ai_review_status}
          </div>
          {diary.ai_review_status === 'pending' && (
            <Button 
              onClick={handleRequestComments}
              disabled={isRequestingComments}
            >
              {isRequestingComments ? "AIが考え中..." : "AIにコメントしてもらう"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {aiComments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">AIからのコメント</h2>
          {aiComments.map((comment) => (
            <Card key={comment.id} className="bg-muted/50">
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <div className="text-3xl">{comment.avatar}</div>
                <div>
                  <h3 className="font-bold">{comment.name}</h3>
                  <p className="text-sm text-muted-foreground">{comment.role}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{comment.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 
