import { NextRequest, NextResponse } from 'next/server';

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

    // Prepare data for storage/email
    const auditData: AuditFormData = {
      business_name: business_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      business_type: business_type.trim(),
      city: city.trim(),
      gmb_url: gmb_url.trim(),
      consent: 'true',
    };

    // TODO: Send to email service (Resend, SendGrid, etc.)
    // TODO: Store in database
    // TODO: Send confirmation email
    // TODO: Trigger audit generation

    console.log('Audit form submission:', auditData);

    // For now, return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Your audit request has been received! Check your email within 24 hours.',
        email: auditData.email,
      },
      { status: 200 }
    );
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
