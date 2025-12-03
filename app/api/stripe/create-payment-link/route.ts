import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const { amount, memberName, memberEmail, planName, gymId } = await request.json()

    // Create a product
    const product = await stripe.products.create({
      name: `${planName} - ${memberName}`,
      description: `Gym membership for ${memberName}`,
    })

    // Create a price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount * 100, // Convert to paise
      currency: "inr",
    })

    // Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment-success`,
        },
      },
      metadata: {
        gym_id: gymId,
        member_name: memberName,
        plan_name: planName,
      },
    })

    return NextResponse.json({
      success: true,
      url: paymentLink.url,
      linkId: paymentLink.id,
    })
  } catch (error: any) {
    console.error("Stripe error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
