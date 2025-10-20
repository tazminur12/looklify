import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

// GET /api/products - Get all products with filtering, sorting, and pagination
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .populate('brand', 'name slug logo')
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get aggregated stats
    const stats = await Product.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockThreshold'] }] },
                1,
                0
              ]
            }
          },
          averagePrice: { $avg: '$price' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit
        },
        stats: stats[0] || {
          totalProducts: 0,
          activeProducts: 0,
          outOfStock: 0,
          lowStock: 0,
          averagePrice: 0,
          totalValue: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    
    // Add createdBy field
    body.createdBy = session.user.id;

    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'price', 'sku', 'productCode'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if SKU already exists
    const existingProductBySKU = await Product.findOne({ sku: body.sku.toUpperCase() });
    if (existingProductBySKU) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 400 }
      );
    }

    // Check if Product Code already exists
    const existingProductByCode = await Product.findOne({ productCode: body.productCode.toUpperCase() });
    if (existingProductByCode) {
      return NextResponse.json(
        { error: 'Product with this Product Code already exists' },
        { status: 400 }
      );
    }

    // Ensure SKU and Product Code are uppercase
    body.sku = body.sku.toUpperCase();
    body.productCode = body.productCode.toUpperCase();

    // Set default values
    body.stock = body.stock || 0;
    body.status = body.status || 'active';

    // Create product
    const product = new Product(body);
    await product.save();

    // Populate the created product
    const populatedProduct = await Product.findById(product._id)
      .populate('createdBy', 'name email')
      .populate('brand', 'name slug logo')
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .lean();

    return NextResponse.json({
      success: true,
      data: populatedProduct,
      message: 'Product created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}
