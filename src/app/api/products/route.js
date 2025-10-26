import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

// GET /api/products - Get all products with filtering, sorting, and pagination (PUBLIC)
export async function GET(request) {
  try {
    // Removed authentication requirement - this is a public API for browsing products
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || 'active'; // Default to active for public
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');

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
      // Check if category is an ObjectId (24 hex characters) or a slug
      if (/^[0-9a-fA-F]{24}$/.test(category)) {
        // It's an ObjectId, filter by category ID
        filter.category = category;
      } else {
        // It's a slug, we need to find the category by slug first
        const categoryDoc = await Category.findOne({ slug: category, status: 'active' });
        if (categoryDoc) {
          filter.category = categoryDoc._id;
        } else {
          // If category not found, return empty results
          return NextResponse.json({
            success: true,
            data: {
              products: [],
              pagination: {
                currentPage: page,
                totalPages: 0,
                totalCount: 0,
                hasNextPage: false,
                hasPrevPage: false,
                limit
              },
              stats: {
                totalProducts: 0,
                activeProducts: 0,
                outOfStock: 0,
                lowStock: 0,
                averagePrice: 0,
                totalValue: 0
              }
            }
          });
        }
      }
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
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
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message, stack: error.stack },
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

    // Remove null and undefined values from nested objects
    const cleanBody = (obj) => {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined || value === '') {
          // Skip null, undefined, and empty string values
          continue;
        } else if (Array.isArray(value)) {
          // Keep arrays even if empty
          cleaned[key] = value;
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          // Recursively clean nested objects
          const cleanedNested = cleanBody(value);
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else {
          cleaned[key] = value;
        }
      }
      return cleaned;
    };

    // Clean the body
    const cleanedBody = cleanBody(body);

    // Handle pricing structure - ensure we have a valid price
    // If we have regularPrice, price should be set to salePrice (if exists) or regularPrice
    if (cleanedBody.regularPrice) {
      // If we have a salePrice, use it as the display price (for backward compatibility)
      if (cleanedBody.salePrice) {
        cleanedBody.price = cleanedBody.salePrice;
      } else if (!cleanedBody.price) {
        // If only regularPrice, use it as price for backward compatibility
        cleanedBody.price = cleanedBody.regularPrice;
      }
    } else if (!cleanedBody.price) {
      // If no regularPrice or price provided
      return NextResponse.json(
        { error: 'Either price or regularPrice is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'sku', 'productCode', 'brand'];
    for (const field of requiredFields) {
      if (!cleanedBody[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Additional validation for pricing
    if (cleanedBody.regularPrice && cleanedBody.salePrice && cleanedBody.salePrice >= cleanedBody.regularPrice) {
      return NextResponse.json(
        { error: 'Sale price must be lower than regular price' },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProductBySKU = await Product.findOne({ sku: cleanedBody.sku.toUpperCase() });
    if (existingProductBySKU) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 400 }
      );
    }

    // Check if Product Code already exists
    const existingProductByCode = await Product.findOne({ productCode: cleanedBody.productCode.toUpperCase() });
    if (existingProductByCode) {
      return NextResponse.json(
        { error: 'Product with this Product Code already exists' },
        { status: 400 }
      );
    }

    // Ensure SKU and Product Code are uppercase
    cleanedBody.sku = cleanedBody.sku.toUpperCase();
    cleanedBody.productCode = cleanedBody.productCode.toUpperCase();

    // Set default values
    cleanedBody.stock = cleanedBody.stock || 0;
    cleanedBody.status = cleanedBody.status || 'active';

    // Create product
    const product = new Product(cleanedBody);
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
