import { NextResponse } from "next/server"

// Mock database - in production, replace with real DB
const members = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    plan: "Premium",
    status: "active",
    joinDate: "2024-01-15",
    expiryDate: "2025-01-15",
  },
]

export async function GET() {
  return NextResponse.json({ data: members })
}

export async function POST(request: Request) {
  const newMember = await request.json()
  const member = { ...newMember, id: Date.now() }
  members.push(member)
  return NextResponse.json({ data: member }, { status: 201 })
}
