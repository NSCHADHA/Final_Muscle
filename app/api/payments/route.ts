import { NextResponse } from "next/server"

// Mock database
const payments = [
  {
    id: 1,
    memberId: 1,
    memberName: "John Doe",
    amount: 7999,
    plan: "Premium",
    date: "2024-11-20",
    mode: "UPI",
    status: "completed",
  },
]

export async function GET() {
  return NextResponse.json({ data: payments })
}

export async function POST(request: Request) {
  const newPayment = await request.json()
  const payment = { ...newPayment, id: Date.now() }
  payments.push(payment)
  return NextResponse.json({ data: payment }, { status: 201 })
}
