const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { name, email, company, type, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    // 1. Send Internal Alert
    const internalAlertResponse = await resend.emails.send({
      from: 'Dunmore Bay Leads <info@thekandelagroup.com>',
      to: 'info@dunmorebay.com',
      reply_to: email,
      subject: `New Lead: ${name}`,
      html: `
        <h2>New Contact Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || 'Not specified'}</p>
        <p><strong>Journey Stage:</strong> ${type || 'Not specified'}</p>
        <p><strong>Message:</strong><br/>${message ? message.replace(/\n/g, '<br/>') : 'None'}</p>
      `,
    });

    // 2. Send User Confirmation
    const userConfirmationResponse = await resend.emails.send({
      from: 'Dunmore Bay Advisors <info@thekandelagroup.com>',
      to: email,
      reply_to: 'info@dunmorebay.com',
      subject: 'We received your inquiry - Dunmore Bay Advisors',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.6;">
          <h2 style="color: #006464;">Thanks for reaching out</h2>
          <p>Hi ${name.split(' ')[0]},</p>
          <p>We've received your inquiry. A deal professional will review your information and get back to you shortly.</p>
          <p>Best regards,<br/>The Dunmore Bay Advisors Team</p>
        </div>
      `,
    });

    if (internalAlertResponse.error) {
      throw new Error(internalAlertResponse.error.message);
    }
    if (userConfirmationResponse.error) {
      throw new Error(userConfirmationResponse.error.message);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}
