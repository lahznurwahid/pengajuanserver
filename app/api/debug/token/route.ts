import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: Request) {
  console.debug("/api/debug/token - authorization header:", request.headers.get("authorization"));
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ message: "Token valid", payload: auth });
}
