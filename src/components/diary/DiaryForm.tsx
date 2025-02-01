"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import { MoodType, moodEmojis } from "@/types/diary"

const moods: MoodType[] = ['happy', 'sad', 'calm', 'frustrated', 'confident']

export function DiaryForm() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [mood, setMood] = useState<MoodType>("happy")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("ユーザーが見つかりません")

      const { error: insertError } = await supabase
        .from('diaries')
        .insert([
          {
            user_id: user.id,
            content,
            mood,
            ai_review_status: 'pending'
          }
        ])

      if (insertError) throw insertError

      router.push("/")
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : "エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>新しい日記を書く</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="mood" className="text-sm font-medium">
              今の気分
            </label>
            <Select value={mood} onValueChange={(value: MoodType) => setMood(value)}>
              <SelectTrigger>
                <SelectValue placeholder="気分を選択" />
              </SelectTrigger>
              <SelectContent>
                {moods.map((mood) => (
                  <SelectItem key={mood} value={mood}>
                    {moodEmojis[mood]} {mood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              日記を書く
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今日はどんな1日でしたか？"
              className="min-h-[200px]"
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? "保存中..." : "保存する"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 
