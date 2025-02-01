import { NextResponse } from 'next/server'
import { AI_PERSONALITIES } from '@/lib/ai'

export async function POST(request: Request) {
  const { content } = await request.json()

  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json(
      { error: "API key is not configured" },
      { status: 500 }
    )
  }

  try {
    const responses = await Promise.all(
      AI_PERSONALITIES.map(async (persona) => {
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
            max_tokens: 500
          })
        })

        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`)
        }

        const data = await response.json()
        return {
          id: persona.id,
          name: persona.name,
          avatar: persona.avatar,
          role: persona.role,
          comment: data.choices[0].message.content
        }
      })
    )

    return NextResponse.json(responses)
  } catch (error) {
    console.error('Error generating AI comments:', error)
    return NextResponse.json(
      { error: "Failed to generate AI comments" },
      { status: 500 }
    )
  }
} 
