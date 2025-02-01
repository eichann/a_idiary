"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { Diary, moodEmojis } from "@/types/diary"
import { AIComment } from "@/types/ai"
import { use } from "react"

// Markdownテキストを改行を保持してHTMLに変換する関数
function formatComment(text: string): string {
  return text
    .split('\n')
    .map(line => {
      // 箇条書きの行
      if (line.trim().startsWith('- ')) {
        return `<li class="ml-4">${line.trim().substring(2)}</li>`
      }
      // 番号付きリストの行
      if (/^\d+\.\s/.test(line.trim())) {
        return `<li class="ml-4">${line.trim().substring(line.trim().indexOf(' ') + 1)}</li>`
      }
      // 見出しの行
      if (line.trim().startsWith('【') && line.trim().endsWith('】')) {
        return `<h4 class="font-bold mt-4 mb-2">${line.trim()}</h4>`
      }
      // 空行
      if (line.trim() === '') {
        return '<br />'
      }
      // 通常の行
      return `<p>${line}</p>`
    })
    .join('\n')
}

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
    setError(null)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: diary.content })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Response body is null')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      // 新しいコメントを一時的に保存する配列
      let newComments: AIComment[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.trim() === '') continue

          try {
            const comment = JSON.parse(line)
            // 重複チェック
            if (!newComments.some(c => c.id === comment.id)) {
              newComments.push(comment)
              
              // UIを即時更新
              setAiComments(prev => {
                if (prev.some(c => c.id === comment.id)) return prev
                return [...prev, comment]
              })
            }
          } catch (e) {
            console.error('Error parsing comment:', e)
          }
        }
      }

      // すべてのコメントを受信した後、一括でデータベースに保存
      if (newComments.length > 0) {
        const { error: insertError } = await supabase
          .from('ai_comments')
          .insert(
            newComments.map(comment => ({
              diary_id: diary.id,
              ai_name: comment.name,
              ai_avatar: comment.avatar,
              ai_role: comment.role,
              comment: comment.comment
            }))
          )

        if (insertError) {
          console.error('Error saving comments to database:', insertError)
          throw new Error('コメントの保存に失敗しました')
        }

        // AIレビューステータスを更新
        const { error: updateError } = await supabase
          .from('diaries')
          .update({ ai_review_status: 'completed' })
          .eq('id', diary.id)

        if (updateError) {
          console.error('Error updating diary status:', updateError)
        } else {
          setDiary(prev => prev ? { ...prev, ai_review_status: 'completed' } : null)
        }
      }

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
        <CardFooter className="flex flex-col space-y-2">
          <div className="w-full flex justify-between items-center">
            <div className="text-sm">
              <p className="text-muted-foreground">
                AIレビューステータス: <span className="font-mono">{diary.ai_review_status}</span>
              </p>
              <p className="text-xs text-muted-foreground/70">
                コメント数: {aiComments.length}
              </p>
            </div>
            {(diary.ai_review_status === 'pending' || diary.ai_review_status === null) && (
              <Button 
                onClick={handleRequestComments}
                disabled={isRequestingComments}
              >
                {isRequestingComments ? "AIが考え中..." : "AIにコメントしてもらう"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {aiComments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">AIからのコメント</h2>
          {aiComments.map((comment, index) => (
            <Card key={`${comment.id}-${index}`} className="bg-muted/50">
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <div className="text-3xl">{comment.avatar}</div>
                <div>
                  <h3 className="font-bold">{comment.name}</h3>
                  <p className="text-sm text-muted-foreground">{comment.role}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formatComment(comment.comment) 
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 
