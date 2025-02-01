export type MoodType = 'happy' | 'sad' | 'calm' | 'frustrated' | 'confident'

export const moodEmojis: Record<MoodType, string> = {
  happy: '😊',
  sad: '😢',
  calm: '😌',
  frustrated: '😤',
  confident: '😎'
}

export type AIReviewStatus = 'pending' | 'in_progress' | 'completed'

export interface Diary {
  id: string
  user_id: string
  content: string
  mood: MoodType
  ai_review_status: AIReviewStatus
  created_at: string
  updated_at: string
}

export interface DiaryFormData {
  content: string
  mood: MoodType
} 
