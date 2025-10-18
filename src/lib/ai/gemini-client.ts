// Google Gemini AI integration for CampusConnect
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export interface AIRecommendationRequest {
  user_id: string
  user_interests: string[]
  user_rsvps: string[]
  user_follows: string[]
  limit?: number
}

export interface AIRecommendation {
  event_id: string
  score: number
  explanation: string
}

export interface AISummarizationRequest {
  content: string
  type: 'event_description' | 'club_description'
}

export interface AISummarizationResponse {
  summary: string
  suggested_tags: string[]
  suggested_category: string
}

export interface AIModerationRequest {
  content: string
  content_type: 'event_title' | 'event_description' | 'club_description'
}

export interface AIModerationResponse {
  is_appropriate: boolean
  confidence: number
  flagged_reasons: string[]
  suggested_changes?: string
}

// Event summarization using Gemini
export async function summarizeEventContent(request: AISummarizationRequest): Promise<AISummarizationResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `
    Analyze the following ${request.type} and provide:
    1. A concise 1-2 sentence summary highlighting the key value proposition
    2. 3-5 relevant tags for categorization
    3. The most appropriate category from: Academic, Cultural, Social, Career, Sports, Volunteer, Technology, Arts
    
    Content: "${request.content}"
    
    Respond in JSON format:
    {
      "summary": "Brief, engaging summary",
      "suggested_tags": ["tag1", "tag2", "tag3"],
      "suggested_category": "Category Name"
    }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse JSON response
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
    
    return {
      summary: parsed.summary || '',
      suggested_tags: parsed.suggested_tags || [],
      suggested_category: parsed.suggested_category || 'Social'
    }
  } catch (error) {
    console.error('Error summarizing content:', error)
    return {
      summary: '',
      suggested_tags: [],
      suggested_category: 'Social'
    }
  }
}

// Content moderation using Gemini
export async function moderateContent(request: AIModerationRequest): Promise<AIModerationResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `
    Review this ${request.content_type} for appropriateness in a university campus environment.
    
    Content: "${request.content}"
    
    Check for:
    - Inappropriate language or content
    - Spam or promotional material
    - Offensive or discriminatory content
    - Misleading information
    - Content that violates university policies
    
    Respond in JSON format:
    {
      "is_appropriate": true/false,
      "confidence": 0.0-1.0,
      "flagged_reasons": ["reason1", "reason2"],
      "suggested_changes": "suggested improvement if needed"
    }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
    
    return {
      is_appropriate: parsed.is_appropriate || true,
      confidence: parsed.confidence || 0.8,
      flagged_reasons: parsed.flagged_reasons || [],
      suggested_changes: parsed.suggested_changes
    }
  } catch (error) {
    console.error('Error moderating content:', error)
    return {
      is_appropriate: true,
      confidence: 0.5,
      flagged_reasons: [],
      suggested_changes: undefined
    }
  }
}

// Generate personalized event recommendations
export async function generateRecommendations(request: AIRecommendationRequest): Promise<AIRecommendation[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `
    Based on the user's profile, generate personalized event recommendations for a university student.
    
    User Profile:
    - Interests: ${request.user_interests.join(', ')}
    - Previously RSVP'd to: ${request.user_rsvps.join(', ')}
    - Following clubs: ${request.user_follows.join(', ')}
    
    Generate ${request.limit || 5} diverse recommendations that balance:
    1. Direct interest alignment (70%)
    2. Discovery of new interests (30%)
    
    For each recommendation, provide:
    - A relevance score (0.0-1.0)
    - A brief explanation of why this event is recommended
    
    Respond in JSON format:
    {
      "recommendations": [
        {
          "event_id": "event_id",
          "score": 0.85,
          "explanation": "Because you're interested in AI and attended similar tech events"
        }
      ]
    }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
    
    return parsed.recommendations || []
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return []
  }
}

// Generate semantic search embeddings
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
    
    const result = await model.embedContent(text)
    return result.embedding.values
  } catch (error) {
    console.error('Error generating embedding:', error)
    return []
  }
}

// Search events using semantic similarity
export async function semanticSearch(query: string, events: any[]): Promise<any[]> {
  try {
    const queryEmbedding = await generateEmbedding(query)
    
    // Calculate similarity scores for each event
    const eventsWithScores = events.map(event => {
      const eventText = `${event.title} ${event.description} ${event.summary || ''}`
      const eventEmbedding = event.embedding || []
      
      // Calculate cosine similarity
      const similarity = calculateCosineSimilarity(queryEmbedding, eventEmbedding)
      
      return {
        ...event,
        similarity_score: similarity
      }
    })
    
    // Sort by similarity score and return top results
    return eventsWithScores
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, 10)
  } catch (error) {
    console.error('Error in semantic search:', error)
    return events
  }
}

// Helper function to calculate cosine similarity
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  
  if (normA === 0 || normB === 0) return 0
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
