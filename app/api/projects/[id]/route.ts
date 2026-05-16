import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message:
      "Neon project detail will be implemented in the next step.",
  });
}

export async function PUT() {
  return NextResponse.json({
    message:
      "Neon project update will be implemented in the next step.",
  });
}

export async function DELETE() {
  return NextResponse.json({
    message:
      "Neon project deletion will be implemented in the next step.",
  });
}
