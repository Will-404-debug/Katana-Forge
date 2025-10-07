import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookie } from "@/lib/auth-helpers";

export async function POST(_request: NextRequest) {
  clearAuthCookie();

  return NextResponse.json({ success: true }, { status: 200 });
}
