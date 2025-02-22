import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const response = await fetch('http://localhost:5001/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to scan barcode');
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error scanning barcode:', error);
    return NextResponse.json({ error: 'Failed to scan barcode' }, { status: 500 });
  }
}
