import { NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@sanity-shared/lib/writeClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const fullname = formData.get('fullname') as string;
    const email = formData.get('email') as string;
    const company = formData.get('company') as string;
    const service = formData.get('service') as string;
    const countryCode = formData.get('countryCode') as string;
    const phone = formData.get('phone') as string;
    const projectDetails = formData.get('projectDetails') as string;
    const projectBrief = formData.get('projectBrief') as File | null;

    // Validate required fields
    if (!fullname || !email || !service || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to Sanity first (as backup)
    const phoneNumber = `${countryCode} ${phone}`;
    try {
      await writeClient.create({
        _type: 'contactSubmission',
        fullname,
        email,
        company: company || '',
        service,
        phone: phoneNumber,
        projectDetails: projectDetails || '',
        submittedAt: new Date().toISOString(),
        status: 'new',
      });
    } catch (sanityError) {
      console.error('Failed to save to Sanity:', sanityError);
      // Continue with email sending even if Sanity save fails
    }

    // Get Zeptomail credentials from environment variables
    const zeptomailToken = process.env.NEXT_PUBLIC_ZEPTOMAIL_TOKEN;
    const zeptomailBounceAddress = process.env.NEXT_PUBLIC_ZEPTOMAIL_BOUNCE_ADDRESS;
    const recipientEmail = process.env.NEXT_PUBLIC_CONTACT_FORM_RECIPIENT_EMAIL;

    if (!zeptomailToken || !zeptomailBounceAddress || !recipientEmail) {
      console.error('Zeptomail configuration missing');
      return NextResponse.json(
        { error: 'Email service configuration error' },
        { status: 500 }
      );
    }

    // Prepare email content
    const emailSubject = `New Contact Form Submission - ${service}`;
    
    const emailBody = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Full Name:</strong> ${fullname}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company/Brand:</strong> ${company || 'Not provided'}</p>
      <p><strong>Service of Interest:</strong> ${service}</p>
      <p><strong>Phone Number:</strong> ${phoneNumber}</p>
      ${projectDetails ? `<p><strong>Project Details:</strong><br/>${projectDetails.replace(/\n/g, '<br/>')}</p>` : ''}
    `;

    // Prepare Zeptomail API request
    const zeptomailPayload: any = {
      bounce_address: zeptomailBounceAddress,
      from: {
        address: zeptomailBounceAddress,
        name: 'DXI Website Contact Form',
      },
      to: [
        {
          email_address: {
            address: recipientEmail,
            name: 'DXI Team',
          },
        },
      ],
      subject: emailSubject,
      htmlbody: emailBody,
    };

    // If there's a file attachment, we'll need to handle it differently
    // Zeptomail supports attachments via their API
    if (projectBrief && projectBrief.size > 0) {
      // Convert file to base64
      const arrayBuffer = await projectBrief.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64File = buffer.toString('base64');

      zeptomailPayload.attachments = [
        {
          name: projectBrief.name,
          content: base64File,
          content_type: projectBrief.type || 'application/octet-stream',
        },
      ];
    }

    // Send email via Zeptomail API
    const zeptomailResponse = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: zeptomailToken, // Token already includes "Zoho-enczapikey" prefix
      },
      body: JSON.stringify(zeptomailPayload),
    });

    if (!zeptomailResponse.ok) {
      const errorData = await zeptomailResponse.text();
      console.error('Zeptomail API error:', errorData);
      console.error('Response status:', zeptomailResponse.status);
      return NextResponse.json(
        { error: 'Failed to send email', details: errorData },
        { status: 500 }
      );
    }

    // Optionally send a confirmation email to the user
    if (email) {
      const confirmationPayload = {
        bounce_address: zeptomailBounceAddress,
        from: {
          address: zeptomailBounceAddress,
          name: 'DXI Marketing',
        },
        to: [
          {
            email_address: {
              address: email,
              name: fullname,
            },
          },
        ],
        subject: 'Thank you for contacting DXI Marketing',
        htmlbody: `
          <h2>Thank you for contacting us!</h2>
          <p>Hi ${fullname},</p>
          <p>We've received your message and our team will get back to you shortly.</p>
          <p>Here's a summary of your inquiry:</p>
          <ul>
            <li><strong>Service:</strong> ${service}</li>
            ${company ? `<li><strong>Company:</strong> ${company}</li>` : ''}
          </ul>
          <p>Best regards,<br/>The DXI Marketing Team</p>
        `,
      };

      // Send confirmation email (non-blocking)
      fetch('https://api.zeptomail.com/v1.1/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: zeptomailToken, // Token already includes "Zoho-enczapikey" prefix
        },
        body: JSON.stringify(confirmationPayload),
      }).catch((err) => {
        console.error('Failed to send confirmation email:', err);
      });
    }

    return NextResponse.json(
      { message: 'Form submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

