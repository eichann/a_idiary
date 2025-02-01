export interface AIPersonality {
  id: number
  name: string
  avatar: string
  role: string
  prompt: string
}

export interface AIComment {
  id: number
  name: string
  avatar: string
  comment: string
  role: string
}

export interface DeepSeekResponse {
  choices: {
    message: {
      content: string
    }
  }[]
} 
