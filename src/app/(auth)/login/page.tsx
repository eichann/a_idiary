"use client"

import Link from "next/link"
import { AuthForm } from "@/components/auth/AuthForm"

export default function LoginPage() {
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
    </div>
  )
} 
