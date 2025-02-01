"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

export function DiaryDashboardClient() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">AI Diary</h1>
            <p className="text-sm text-gray-600">ようこそ、{user?.email}さん</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            ログアウト
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">最近の日記</h2>
          <p className="text-gray-600">
            まだ日記がありません。新しい日記を書いてみましょう。
          </p>
        </div>
      </div>
    </div>
  )
} 
