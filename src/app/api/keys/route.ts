import { NextRequest, NextResponse } from "next/server";
import { getAllKeys, addKey } from "@/lib/db";

export async function GET() {
  const keys = getAllKeys().map(({ api_key, ...rest }) => ({
    ...rest,
    api_key: api_key.slice(0, 8) + "****" + api_key.slice(-4),
  }));
  return NextResponse.json(keys);
}

export async function POST(request: NextRequest) {
  const { name, provider, api_key } = await request.json();

  if (!name || !provider || !api_key) {
    return NextResponse.json({ error: "name, provider, and api_key are required" }, { status: 400 });
  }

  const key = addKey(name, provider, api_key);
  return NextResponse.json({ ...key, api_key: key.api_key.slice(0, 8) + "****" + key.api_key.slice(-4) }, { status: 201 });
}
