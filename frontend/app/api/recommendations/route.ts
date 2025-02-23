import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
  try {
    console.log('API route: Starting recommendation request');
    
    const requestData = await req.json();
    console.log('API route: Received request data:', requestData);
    
    const { productCode, productName, keywords, nutriScore } = requestData;
    
    if (!productName) {
      console.error('API route: Missing product name');
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }
    
    console.log('API route: Starting recommendation API request:', {
      productName,
      keywords,
      nutriScore
    });
    
    // Call the Python model to generate recommendations
    const pythonPath = path.join(process.cwd(), '..', 'backend', 'model', 'model.py');
    console.log('API route: Python script path:', pythonPath);
    
    const pythonArgs = [
      pythonPath,
      '--product_name', productName,
      '--keywords', keywords ? keywords.join(',') : '',
      '--nutriscore', nutriScore || ''
    ];
    
    console.log('API route: Spawning Python process with args:', pythonArgs);
    
    const pythonProcess = spawn('python3', pythonArgs);

    // Get the results from Python process
    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      pythonOutput += output;
      console.log('API route: Python stdout:', output);
    });

    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString();
      pythonError += error;
      console.error('API route: Python stderr:', error);
    });

    // Wait for Python process to complete
    const recommendations = await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        console.log('API route: Python process exited with code:', code);
        console.log('API route: Final Python output:', pythonOutput);
        
        if (code === 0) {
          try {
            // Find the JSON array in the output
            const jsonMatch = pythonOutput.match(/\[.*\]/);
            if (!jsonMatch) {
              console.error('API route: No JSON array found in Python output');
              reject(new Error('No recommendations found in output'));
              return;
            }
            
            const jsonStr = jsonMatch[0];
            console.log('API route: Extracted JSON string:', jsonStr);
            
            const result = JSON.parse(jsonStr);
            console.log('API route: Parsed recommendations:', result);
            
            if (Array.isArray(result)) {
              if (result.length > 0 && result[0].error) {
                console.error('API route: Error in recommendations:', result[0].error);
                reject(new Error(result[0].error));
              } else {
                resolve(result);
              }
            } else {
              console.error('API route: Invalid response format');
              reject(new Error('Invalid response format from Python'));
            }
          } catch (e) {
            console.error('API route: Failed to parse Python output:', e);
            reject(new Error('Failed to parse Python output'));
          }
        } else {
          console.error('API route: Python process failed:', pythonError);
          reject(new Error(`Python process failed with code ${code}: ${pythonError}`));
        }
      });
    });

    console.log('API route: Sending recommendations back to client:', recommendations);
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('API route: Error in recommendations API:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
