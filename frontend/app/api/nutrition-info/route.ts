import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    interface NutrientInfo {
      risks: string;
      alternatives: string;
    }

    const { nutrientType, value, unit } = await req.json();

    const nutrientDefaults: { [key: string]: NutrientInfo } = {
      'Energy': {
        risks: 'weight gain, metabolic issues',
        alternatives: 'vegetables, lean proteins, complex carbs'
      },
      'Proteins': {
        risks: 'kidney strain, digestive issues',
        alternatives: 'legumes, quinoa, tofu'
      },
      'Carbohydrates': {
        risks: 'blood sugar spikes, weight gain',
        alternatives: 'whole grains, vegetables, legumes'
      },
      'Sugars': {
        risks: 'diabetes, tooth decay, obesity',
        alternatives: 'fruits, honey, stevia'
      },
      'Fat': {
        risks: 'cardiovascular issues, obesity',
        alternatives: 'avocados, nuts, olive oil'
      },
      'Saturated Fat': {
        risks: 'heart disease, cholesterol issues',
        alternatives: 'fish, nuts, plant oils'
      },
      'Fiber': {
        risks: 'digestive issues, dehydration',
        alternatives: 'whole grains, vegetables, fruits'
      },
      'Salt': {
        risks: 'high blood pressure, water retention',
        alternatives: 'herbs, spices, lemon'
      }
    };

    const defaultInfo: NutrientInfo = {
      risks: 'overconsumption effects, imbalance issues',
      alternatives: 'balanced whole foods'
    };

    const info = nutrientDefaults[nutrientType as string] || defaultInfo;

    const prompt = `Analyze ${value}${unit} of ${nutrientType} per 100g of food and respond in this general format and use proper punctuation:

Amount and Significance
{Give a brief description of what this nutrient does}. This amount of ${value}${unit} is [low/moderate/high] for 100g of foods

Risks and Alternatives
Risks: [2-3 specific health risks with a bit of description related to ${nutrientType}]
Great supplement foods: [2-3 specific food alternatives with less ${nutrientType}]

Rules:
- Must follow exact format above
- Must include specific risks and alternatives unique to ${nutrientType}
- No periods at end of items
- Keep each list to exactly 2-3 items
- Use commas between items
- No extra text or explanations
- No extra newlines`;

    const response = await fetch('https://api.cerebras.ai/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 200,
        temperature: 0.3, // Slightly increased for more variation
        model: 'llama3.3-70b',
        stop: ["\n\n\n"],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate content');
    }

    const data = await response.json();
    let text = data.choices[0].text.trim();

    // Extract sections using regex for more reliable parsing
    const amountMatch = text.match(/Amount and Significance\n(.*)\n/);
    const risksMatch = text.match(/Risks: (.*?)(?=\n|$)/);
    const alternativesMatch = text.match(/Great supplement foods: (.*?)(?=\n|$)/);

    const amount = amountMatch?.[1]?.trim() || `This amount of ${value}${unit} is moderate for 100g of foods`;
    const risks = risksMatch?.[1]?.trim() || info.risks;
    const alternatives = alternativesMatch?.[1]?.trim() || info.alternatives;

    // Format the text into proper HTML with strict structure
    const formattedHtml = `
      <div class="space-y-4">
        <div class="space-y-2">
          <h3 class="font-medium text-gray-800">Amount and Significance</h3>
          <p class="text-gray-600">${amount}</p>
        </div>

        <div class="space-y-2">
          <h3 class="font-medium text-gray-800">Risks and Alternatives</h3>
          <div class="space-y-1">
            <p class="text-gray-600">
              <span class="font-medium text-gray-700">Risks:</span> 
              ${risks}
            </p>
            <p class="text-gray-600">
              <span class="font-medium text-gray-700">Great supplement foods:</span> 
              ${alternatives}
            </p>
          </div>
        </div>
      </div>
    `;

    return NextResponse.json({ info: formattedHtml });
  } catch (error) {
    console.error('Error generating nutrition info:', error);
    return NextResponse.json(
      { error: 'Failed to generate nutrition information' },
      { status: 500 }
    );
  }
} 