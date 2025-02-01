"use client"

import Link from "next/link"
import { AuthForm } from "@/components/auth/AuthForm"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">AI Diary</h1>
          <p className="text-sm text-gray-600 mt-2">
            新しいアカウントを作成
          </p>
        </div>
        
        <AuthForm mode="signup" />
        
        <p className="text-center text-sm text-gray-600">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
} 
