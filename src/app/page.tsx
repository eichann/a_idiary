"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DiaryList } from "@/components/diary/DiaryList"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkAuth()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          {user ? `${user.email}さんの日記` : "日記"}
        </h1>
        <div className="space-x-4">
          <Button onClick={() => router.push("/diary/new")}>
            新しい日記を書く
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            ログアウト
          </Button>
        </div>
      </div>
      <DiaryList />
    </div>
  )
}
