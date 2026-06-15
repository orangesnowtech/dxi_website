import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { writeClient } from '@sanity-shared/lib/writeClient';
import { firestore } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getZeptoConfig() {
  const bounceAddress = (
    process.env.ZEPTOMAIL_BOUNCE_ADDRESS ||
    process.env.ZEPTOMAIL_SENDER_ADDRESS ||
    'info@dximarketing.com'
  ).trim();

  const fromAddress = (
    process.env.ZEPTOMAIL_SENDER_ADDRESS ||
    bounceAddress ||
    'info@dximarketing.com'
  ).trim();

  return {
    token: (process.env.ZEPTOMAIL_TOKEN || process.env.NEXT_PUBLIC_ZEPTOMAIL_TOKEN || '').trim(),
    bounceAddress,
    fromAddress,
    recipientEmail: (
      process.env.CONTACT_FORM_RECIPIENT_EMAIL ||
      'info@dximarketing.com'
    ).trim(),
  };
}

async function sendZeptoEmail(payload: Record<string, unknown>, token: string) {
  const response = await fetch('https://api.zeptomail.com/v1.1/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ZeptoMail error ${response.status}: ${errorText}`);
  }
}

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

    let submissionRef;
    try {
      submissionRef = await firestore.collection('contactSubmissions').add({
        fullName: fullname,
        emailAddress: email,
        phoneNumber,
        company: company || '',
        service,
        projectDetails: projectDetails || '',
        attachmentName: projectBrief?.name || '',
        attachmentContentType: projectBrief?.type || '',
        attachmentSize: projectBrief?.size || 0,
        status: 'new',
        source: 'website',
        createdAt: FieldValue.serverTimestamp(),
        submittedAt: new Date().toISOString(),
      });
      console.log('Contact submission saved to Firebase:', submissionRef.id);
    } catch (firebaseError) {
      console.error('Failed to save to Firebase:', firebaseError);
      throw new Error(`Firebase save failed: ${firebaseError instanceof Error ? firebaseError.message : 'Unknown error'}`);
    }

    const { token: zeptomailToken, bounceAddress, fromAddress, recipientEmail } = getZeptoConfig();

    if (!zeptomailToken || !bounceAddress || !fromAddress || !recipientEmail) {
      console.error('Zeptomail configuration missing');
      return NextResponse.json(
        {
          message: 'Contact form submitted successfully, but email notifications are not configured.',
          submissionId: submissionRef.id,
        },
        { status: 200 }
      );
    }

    // Prepare email content
    const emailSubject = `New Contact Form Submission - ${service}`;
    
    const emailBody = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Submission ID:</strong> ${escapeHtml(submissionRef.id)}</p>
      <p><strong>Full Name:</strong> ${escapeHtml(fullname)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Company/Brand:</strong> ${escapeHtml(company || 'Not provided')}</p>
      <p><strong>Service of Interest:</strong> ${escapeHtml(service)}</p>
      <p><strong>Phone Number:</strong> ${escapeHtml(phoneNumber)}</p>
      ${projectDetails ? `<p><strong>Project Details:</strong><br/>${escapeHtml(projectDetails).replace(/\n/g, '<br/>')}</p>` : ''}
    `;

    // Prepare Zeptomail API request
    const zeptomailPayload: any = {
      bounce_address: bounceAddress,
      from: {
        address: fromAddress,
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

    // Send email via Zeptomail API (non-blocking, won't fail the submission)
    try {
      await sendZeptoEmail(zeptomailPayload, zeptomailToken);
      console.log('Email sent successfully to:', recipientEmail);
    } catch (emailError) {
      console.error('Failed to send email (submission still saved):', emailError);
      // Don't fail the request if email fails - submission is already saved
    }

    // Optionally send a confirmation email to the user
    if (email) {
      const confirmationPayload = {
        bounce_address: bounceAddress,
        from: {
          address: fromAddress,
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
          <p>Hi ${escapeHtml(fullname)},</p>
          <p>We've received your message and our team will get back to you shortly.</p>
          <p>Here's a summary of your inquiry:</p>
          <ul>
            <li><strong>Service:</strong> ${escapeHtml(service)}</li>
            ${company ? `<li><strong>Company:</strong> ${escapeHtml(company)}</li>` : ''}
          </ul>
          <p>Best regards,<br/>The DXI Marketing Team</p>
        `,
      };

      // Send confirmation email (non-blocking)
      sendZeptoEmail(confirmationPayload, zeptomailToken).catch((err) => {
        console.error('Failed to send confirmation email:', err);
      });
    }

    return NextResponse.json(
      { message: 'Form submitted successfully', submissionId: submissionRef.id },
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

