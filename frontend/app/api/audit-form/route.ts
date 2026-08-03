import { NextRequest, NextResponse } from 'next/server';
import { createAuditSubmission } from '@/lib/db/audit-submissions';

interface AuditFormData {
  business_name: string;
  email: string;
  phone: string;
  business_type: string;
  city: string;
  gmb_url?: string;
  consent: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Validate required fields
    const business_name = formData.get('business_name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const business_type = formData.get('business_type') as string;
    const city = formData.get('city') as string;
    const gmb_url = (formData.get('gmb_url') as string) || '';
    const consent = formData.get('consent') as string;

    // Validation
    if (!business_name?.trim()) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    if (!email?.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!business_type?.trim()) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    if (!city?.trim()) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: 'You must consent to receive audit results' },
        { status: 400 }
      );
    }

    // Prepare data for storage
    const auditData: AuditFormData = {
      business_name: business_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      business_type: business_type.trim(),
      city: city.trim(),
      gmb_url: gmb_url.trim(),
      consent: 'true',
    };

    // Store in MongoDB
    try {
      const submission = await createAuditSubmission({
        business_name: auditData.business_name,
        email: auditData.email,
        phone: auditData.phone,
        business_type: auditData.business_type,
        city: auditData.city,
        gmb_url: auditData.gmb_url,
        // Extract UTM parameters from referrer
        utm_source: request.headers.get('referer') ? 'google_ads' : undefined,
      });

      console.log('Audit submission saved:', submission._id);

      // TODO: Send confirmation email via email service (Resend, SendGrid, etc.)
      // TODO: Queue audit generation job
      // TODO: Send audit results email after generation

      // Track in GA
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'audit_form_submission_completed', {
          email: auditData.email,
          business_type: auditData.business_type,
          city: auditData.city,
        });
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Your audit request has been received! Check your email within 24 hours.',
          email: auditData.email,
          submissionId: submission._id,
        },
        { status: 200 }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Still return success to user even if DB fails (graceful degradation)
      return NextResponse.json(
        {
          success: true,
          message: 'Your audit request has been received! Check your email within 24 hours.',
          email: auditData.email,
          warning: 'Some features may be limited',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
