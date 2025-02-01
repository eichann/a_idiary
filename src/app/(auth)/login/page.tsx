"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { AuthForm } from "@/components/auth/AuthForm"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    // 新規登録からのリダイレクトの場合
    if (searchParams.get("from") === "signup") {
      toast({
        title: "メール認証が必要です",
        description: "登録したメールアドレスに認証メールを送信しました。メールを確認して認証を完了してください。",
        duration: 10000, // 10秒間表示
      })
    }
  }, [searchParams, toast])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">AI Diary</h1>
          <p className="text-sm text-gray-600 mt-2">
            AIがあなたの日記をサポートします
          </p>
        </div>
        
        <AuthForm mode="login" />
        
        <p className="text-center text-sm text-gray-600">
          アカウントをお持ちでない方は{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            新規登録
          </Link>
        </p>
      </div>
      <Toaster />
    </div>
  )
} 
