import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { members, payments, context } = await request.json()

    // Build comprehensive gym data analysis
    const activeMembers = members.filter((m: any) => {
      const expiry = new Date(m.expiry_date)
      return expiry > new Date()
    })

    const expiringMembers = members.filter((m: any) => {
      const expiry = new Date(m.expiry_date)
      const daysLeft = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysLeft > 0 && daysLeft <= 7
    })

    const totalRevenue = payments
      .filter((p: any) => p.status === "completed")
      .reduce((sum: number, p: any) => sum + p.amount, 0)

    const averagePayment = totalRevenue / (payments.length || 1)

    const prompt = `You are an expert gym business consultant. Analyze this gym's data and provide 5-6 specific, actionable recommendations to grow the business.

Gym Data:
- Total Members: ${members.length}
- Active Members: ${activeMembers.length}
- Members Expiring Soon (7 days): ${expiringMembers.length}
- Total Revenue: ₹${totalRevenue}
- Average Payment: ₹${Math.round(averagePayment)}
- Recent Context: ${context || "No additional context"}

Focus on:
1. Member retention strategies
2. Revenue optimization
3. Operational improvements
4. Marketing tactics
5. Customer engagement

Provide recommendations in a numbered list format with specific actions the gym owner can take immediately. Be concise and actionable.`

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
    })

    return NextResponse.json({ recommendations: text })
  } catch (error: any) {
    console.error("AI Recommendations error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
