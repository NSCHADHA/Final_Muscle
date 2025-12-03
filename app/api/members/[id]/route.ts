import { NextResponse } from "next/server"

// This API route is kept for backward compatibility but not actively used

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  const updatedMember = await request.json()

  // Since we're using Supabase, this mock implementation is not used
  // Return a placeholder response
  return NextResponse.json({
    data: { id, ...updatedMember },
    message: "This endpoint is deprecated. Use Supabase client-side operations instead.",
  })
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  return NextResponse.json({
    success: true,
    message: "This endpoint is deprecated. Use Supabase client-side operations instead.",
  })
}
