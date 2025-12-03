import { NextResponse } from "next/server"

// Mock database
const plans = [
  {
    id: 1,
    name: "Basic",
    price: 2999,
    duration: 30,
    features: ["Access to gym", "Locker facility", "Water & towel"],
  },
  {
    id: 2,
    name: "Standard",
    price: 4999,
    duration: 30,
    features: ["Everything in Basic", "Personal trainer (2 sessions)", "Nutrition plan", "Membership card"],
  },
  {
    id: 3,
    name: "Premium",
    price: 7999,
    duration: 30,
    features: [
      "Everything in Standard",
      "Personal trainer (8 sessions)",
      "Group classes",
      "Priority support",
      "Guest passes (4/month)",
    ],
  },
]

export async function GET() {
  return NextResponse.json({ data: plans })
}
