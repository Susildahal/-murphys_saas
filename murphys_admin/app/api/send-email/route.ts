import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { to, subject, body } = data || {};

    if (!to || !subject || !body) {
      return NextResponse.json({ message: 'Missing required fields: to, subject, body' }, { status: 400 });
    }

    // If a SendGrid API key is configured, use it to send the email.
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const SENDGRID_FROM = process.env.SENDGRID_FROM || 'no-reply@example.com';

    if (SENDGRID_API_KEY) {
      const payload = {
        personalizations: [
          { to: [{ email: to }] }
        ],
        from: { email: SENDGRID_FROM },
        subject,
        content: [
          { type: 'text/plain', value: body }
        ]
      };

      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SENDGRID_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('SendGrid response error', res.status, text);
        return NextResponse.json({ message: 'Failed to send email via SendGrid' }, { status: 502 });
      }

      return NextResponse.json({ message: 'Email sent via SendGrid' }, { status: 200 });
    }

    // No provider configured: accept request but respond with a stub message.
    console.warn('Email send endpoint hit but no provider configured. Request:', { to, subject });
    return NextResponse.json({ message: 'Email endpoint reached (no provider configured). Request accepted for development/testing.' }, { status: 200 });
  } catch (err) {
    console.error('Error in /api/send-email:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
