import { NextResponse } from 'next/server'
import { AI_PERSONALITIES } from '@/lib/ai'

export const maxDuration = 60 // 60秒

// レスポンスをストリームとしてエンコードする関数
function encodeStream(data: any) {
  const encoder = new TextEncoder()
  return encoder.encode(JSON.stringify(data) + '\n')
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      )
    }

    if (!process.env.DEEPSEEK_API_BASE_URL) {
      return NextResponse.json(
        { error: "API base URL is not configured" },
        { status: 500 }
      )
    }

    // ストリームレスポンスを作成
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // 各AIパーソナリティの処理を開始
    Promise.all(
      AI_PERSONALITIES.map(async (persona) => {
        try {
          const response = await fetch(`${process.env.DEEPSEEK_API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                { role: "system", content: persona.prompt },
                { role: "user", content }
              ],
              temperature: 0.7,
              max_tokens: 500,
              stream: true // ストリーミングを有効化
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error(`API error for ${persona.name}:`, errorText)
            throw new Error(`API request failed: ${response.status} ${response.statusText}`)
          }

          if (!response.body) {
            throw new Error('Response body is null')
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()

          let accumulatedResponse = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.trim() === '') continue
              if (line.trim() === 'data: [DONE]') continue

              try {
                const cleanedLine = line.replace(/^data: /, '')
                const parsed = JSON.parse(cleanedLine)
                
                if (parsed.choices?.[0]?.delta?.content) {
                  accumulatedResponse += parsed.choices[0].delta.content
                }
              } catch (e) {
                console.error('Error parsing chunk:', e)
              }
            }
          }

          // 完全なレスポンスをストリームに書き込む
          await writer.write(encodeStream({
            id: persona.id,
            name: persona.name,
            avatar: persona.avatar,
            role: persona.role,
            comment: accumulatedResponse
          }))

        } catch (personaError) {
          console.error(`Error processing ${persona.name}:`, personaError)
          await writer.write(encodeStream({
            id: persona.id,
            name: persona.name,
            avatar: persona.avatar,
            role: persona.role,
            comment: `申し訳ありません。コメントの生成中にエラーが発生しました。`
          }))
        }
      })
    ).finally(async () => {
      await writer.close()
    })

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

  } catch (error) {
    console.error('Error in AI comment generation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AIコメントの生成中に予期せぬエラーが発生しました。" },
      { status: 500 }
    )
  }
} 
