import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  try {
    const { encryptedKey } = await req.json();

    if (!encryptedKey) {
      return NextResponse.json({ success: false, error: "Missing encrypted key" }, { status: 400 });
    }

    const rawKey = decrypt(encryptedKey.trim());

    if (!rawKey) {
      return NextResponse.json({ success: false, error: "Decryption failed. Invalid key or corrupted data." }, { status: 500 });
    }

    return NextResponse.json({ success: true, decryptedKey: rawKey });

  } catch (error: any) {
    console.error("Rescue API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}