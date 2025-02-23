import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { additiveCode } = await request.json();

    // Remove any language prefix and clean the code
    const cleanCode = additiveCode.split(':').pop() || additiveCode;
    
    const prompt = `Provide information about food additive ${cleanCode} in the following format:

Amount and Significance
{Brief explanation of what this additive is used for}. This amount is [low/moderate/high] for processed foods.
Common products: [2-3 specific products]
Typical usage: [brief amount range]

Risks and Alternatives
Risks: [2-3 specific health risks with brief description]
Natural alternatives: [2-3 specific natural alternatives]

Rules:
- Must follow exact format above
- Must include specific risks and alternatives unique to ${cleanCode}
- No periods at end of items
- Keep each list to exactly 2-3 items
- Use commas between items
- No extra text or explanations
- No extra newlines`;

    const response = await fetch('https://api.cerebras.ai/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 200,
        temperature: 0.3,
        model: 'llama3.3-70b',
        stop: ["\n\n\n"],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Cerebras API');
    }

    const data = await response.json();
    const rawInfo = data.choices[0].text.trim();

    // Extract sections using regex
    const amountMatch = rawInfo.match(/Amount and Significance\n([^]*?)(?=\n\nRisks|$)/);
    const risksMatch = rawInfo.match(/Risks and Alternatives\n([^]*?)$/);

    // Parse amount section
    const amountText = amountMatch ? amountMatch[1].trim() : '';
    const commonProductsMatch = amountText.match(/Common products: (.*?)(?=\n|$)/);
    const typicalUsageMatch = amountText.match(/Typical usage: (.*?)(?=\n|$)/);
    const mainDescription = amountText.split('\n')[0];

    // Parse risks section
    const risksText = risksMatch ? risksMatch[1].trim() : '';
    const risksListMatch = risksText.match(/Risks: (.*?)(?=\n|$)/);
    const alternativesMatch = risksText.match(/Natural alternatives: (.*?)(?=\n|$)/);

    // Format the response as HTML with matching styles to nutrition info
    const formattedInfo = `
      <div class="space-y-4">
        <div class="space-y-2">
          <h3 class="font-medium text-gray-800">Amount and Significance</h3>
          <p class="text-gray-600">${mainDescription || 'Information not available'}</p>
          <div class="space-y-1">
            <p class="text-gray-600">
              <span class="font-medium text-gray-700">Common products:</span> 
              ${commonProductsMatch ? commonProductsMatch[1].trim() : 'Information not available'}
            </p>
            <p class="text-gray-600">
              <span class="font-medium text-gray-700">Typical usage:</span> 
              ${typicalUsageMatch ? typicalUsageMatch[1].trim() : 'Information not available'}
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <h3 class="font-medium text-gray-800">Risks and Alternatives</h3>
          <div class="space-y-1">
            <p class="text-gray-600">
              <span class="font-medium text-gray-700">Risks:</span> 
              ${risksListMatch ? risksListMatch[1].trim() : 'Information not available'}
            </p>
            <p class="text-gray-600">
              <span class="font-medium text-gray-700">Natural alternatives:</span> 
              ${alternativesMatch ? alternativesMatch[1].trim() : 'Information not available'}
            </p>
          </div>
        </div>
      </div>
    `;

    return NextResponse.json({ info: formattedInfo });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch additive information' },
      { status: 500 }
    );
  }
} 