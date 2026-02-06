import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, type, description } = body;

    // VALIDATION (Real world check)
    if (!email || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // TODO: CONNECT TO DATABASE OR EMAIL PROVIDER HERE
    // Example: await db.tickets.create({ email, type, description, status: 'OPEN' })
    // Example: await resend.emails.send({ to: 'support@corecoin.com', subject: type, text: description })

    console.log("SERVER RECEIVED TICKET:", body); // Verify this in your VS Code terminal

    return NextResponse.json({ success: true, ticketId: `CORE-${Date.now().toString().slice(-4)}` });
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}