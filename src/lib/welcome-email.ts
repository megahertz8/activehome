import { resend } from './resend';

export async function sendWelcomeEmail(email: string, name?: string) {
  const firstName = name?.split(' ')[0] || 'there';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Evolving Home</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td style="padding: 40px 30px;">
        <h1 style="font-size: 32px; font-weight: 700; margin: 0 0 24px 0; color: #ffffff;">Welcome, ${firstName}! 🏠</h1>
        <p style="font-size: 18px; line-height: 1.6; margin: 0 0 24px 0; color: #e2e8f0;">We're thrilled you've joined <strong>Evolving Home</strong>. Discover how efficient your home really is and unlock savings.</p>
        <p style="font-size: 16px; margin: 0 0 32px 0; color: #e2e8f0;">Get started in seconds:</p>
        <ul style="font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; padding-left: 20px; color: #e2e8f0;">
          <li>Save your home address</li>
          <li>Get your personalized energy score</li>
          <li>Discover savings opportunities</li>
        </ul>
        <a href="https://evolvinghome.vercel.app" style="background-color: #8b5cf6; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block;">Go to Dashboard →</a>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px 30px; background-color: #111827; border-top: 1px solid #374151;">
        <p style="font-size: 14px; line-height: 1.5; margin: 0 0 12px 0; color: #9ca3af;">Evolving Home — Your home's energy score in 30 seconds</p>
        <p style="font-size: 14px; margin: 0; color: #9ca3af;"><a href="#" style="color: #8b5cf6;">Unsubscribe</a> | <a href="https://evolvinghome.ai" style="color: #8b5cf6;">Contact</a></p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: 'Evolving Home <hello@evolvinghome.ai>',
    to: email,
    subject: 'Welcome to Evolving Home 🏠',
    html,
  });
}
