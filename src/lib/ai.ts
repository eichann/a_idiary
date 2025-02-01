import { AIPersonality, AIComment } from "@/types/ai"

export const AI_PERSONALITIES: AIPersonality[] = [
  {
    id: 1,
    name: "共感AI",
    avatar: "🤗",
    role: "あなたの気持ちに寄り添い、共感するAI",
    prompt: "あなたは共感力の高いAIアシスタントです。ユーザーの日記を読んで、その気持ちに深く共感し、励ましのメッセージを送ってください。特に感情面に注目し、ユーザーの気持ちを理解していることが伝わるような返信を心がけてください。"
  },
  {
    id: 2,
    name: "分析AI",
    avatar: "🔍",
    role: "客観的な視点から分析するAI",
    prompt: "あなたは分析力に優れたAIアシスタントです。ユーザーの日記を読んで、その内容を客観的に分析し、気づきや洞察を提供してください。特に行動パターンや思考の特徴に注目し、建設的なフィードバックを提供してください。"
  },
  {
    id: 3,
    name: "助言AI",
    avatar: "💡",
    role: "建設的なアドバイスを提供するAI",
    prompt: "あなたは問題解決に長けたAIアシスタントです。ユーザーの日記を読んで、より良い未来に向けての具体的なアドバイスを提供してください。特に実践可能な提案を心がけ、ユーザーの成長を支援するような助言を行ってください。"
  }
]

export async function generateAIComments(content: string): Promise<AIComment[]> {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'AIコメントの生成に失敗しました')
    }

    const comments = await response.json()
    return comments
  } catch (error) {
    console.error('Error generating AI comments:', error)
    throw error
  }
} 
