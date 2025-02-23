import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/lib/models/Product';

export async function POST(req: Request) {
  console.log('POST /api/products called');
  try {
    await connectToDatabase();
    const product = await req.json();
    
    console.log('Received product data:', product);
    
    if (!product.barcode) {
      console.error('Missing barcode in product data');
      return NextResponse.json({ error: 'Barcode is required' }, { status: 400 });
    }

    try {
      const existingProduct = await Product.findOne({ barcode: product.barcode });
      if (existingProduct) {
        console.log('Found existing product:', existingProduct);
        return NextResponse.json(existingProduct);
      }
    } catch (error) {
      console.error('Error checking for existing product:', error);
      return NextResponse.json({ error: 'Database query error' }, { status: 500 });
    }

    try {
      console.log('Creating new product with data:', product);
      const newProduct = await Product.create({
        barcode: product.barcode,
        name: product.name,
        brands: product.brands || [],
        ingredients: product.ingredients || [],
        nutriments: product.nutriments || {},
        allergens: product.allergens || [],
        labels: product.labels || [],
        categories: product.categories || [],
        packaging: product.packaging || [],
        nova_group: product.nova_group,
        nutriscore_grade: product.nutriscore_grade,
        image_url: product.image_url,
      });
      console.log('Created new product:', newProduct);
      return NextResponse.json(newProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  console.log('GET /api/products called');
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const barcode = searchParams.get('barcode');

    if (barcode) {
      try {
        const product = await Product.findOne({ barcode }).sort({ created_at: -1 });
        if (!product) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json(product);
      } catch (error) {
        console.error('Error finding product by barcode:', error);
        return NextResponse.json({ error: 'Database query error' }, { status: 500 });
      }
    }

    try {
      const products = await Product.find().sort({ created_at: -1 }).limit(10);
      return NextResponse.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Database query error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 