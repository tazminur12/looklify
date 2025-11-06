'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ReviewsPage() {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filters = [
    { id: 'all', name: 'All Reviews' },
    { id: '5', name: '5 Stars' },
    { id: '4', name: '4 Stars' },
    { id: '3', name: '3 Stars' },
    { id: '2', name: '2 Stars' },
    { id: '1', name: '1 Star' },
  ];

  const reviews = [
    {
      id: 1,
      name: 'Sarah Ahmed',
      rating: 5,
      date: '2024-01-15',
      product: 'Vitamin C Serum',
      review: 'Absolutely love this product! My skin has never looked better. The serum is lightweight, absorbs quickly, and I can already see a difference in my skin tone. Highly recommend!',
      verified: true,
    },
    {
      id: 2,
      name: 'Fatima Khan',
      rating: 5,
      date: '2024-01-12',
      product: 'Hyaluronic Acid Moisturizer',
      review: 'This moisturizer is amazing! My skin feels so hydrated and plump. It works great under makeup too. Will definitely repurchase!',
      verified: true,
    },
    {
      id: 3,
      name: 'Ayesha Rahman',
      rating: 5,
      date: '2024-01-10',
      product: 'Retinol Night Cream',
      review: 'Best purchase ever! My fine lines have reduced significantly. The cream is not too heavy and doesn\'t cause any irritation. Love it!',
      verified: true,
    },
    {
      id: 4,
      name: 'Zara Ali',
      rating: 5,
      date: '2024-01-08',
      product: 'Niacinamide Serum',
      review: 'Great product for oily skin! It has helped control my oil production and reduced my pores. The texture is perfect and it doesn\'t feel sticky.',
      verified: true,
    },
    {
      id: 5,
      name: 'Meera Hassan',
      rating: 5,
      date: '2024-01-05',
      product: 'Sunscreen SPF 50',
      review: 'Perfect sunscreen for daily use! It doesn\'t leave a white cast and feels lightweight. Great protection and works well under makeup.',
      verified: true,
    },
    {
      id: 6,
      name: 'Nadia Islam',
      rating: 4,
      date: '2024-01-03',
      product: 'Cleansing Balm',
      review: 'Good cleansing balm that removes makeup effectively. The texture is nice and it doesn\'t leave my skin feeling dry. Would recommend!',
      verified: true,
    },
    {
      id: 7,
      name: 'Layla Chowdhury',
      rating: 5,
      date: '2024-01-01',
      product: 'AHA BHA Exfoliating Toner',
      review: 'This toner has transformed my skin! It has helped with my texture and acne. My skin looks smoother and brighter. Worth every penny!',
      verified: true,
    },
    {
      id: 8,
      name: 'Riya Ahmed',
      rating: 4,
      date: '2023-12-28',
      product: 'Ceramide Moisturizer',
      review: 'Nice moisturizer for sensitive skin. It\'s gentle and doesn\'t cause any reactions. The packaging is good too. Overall satisfied!',
      verified: true,
    },
    {
      id: 9,
      name: 'Tasnim Rahman',
      rating: 5,
      date: '2023-12-25',
      product: 'Peptide Eye Cream',
      review: 'Amazing eye cream! It has reduced my dark circles and fine lines around my eyes. The texture is perfect and it absorbs quickly.',
      verified: true,
    },
    {
      id: 10,
      name: 'Isha Hossain',
      rating: 5,
      date: '2023-12-22',
      product: 'Glycolic Acid Serum',
      review: 'Love this serum! It has helped with my acne scars and hyperpigmentation. My skin looks more even-toned now. Highly recommend!',
      verified: true,
    },
    {
      id: 11,
      name: 'Anika Karim',
      rating: 4,
      date: '2023-12-20',
      product: 'Face Wash',
      review: 'Good face wash that cleanses well without stripping the skin. It has a nice lather and leaves my skin feeling clean and fresh.',
      verified: true,
    },
    {
      id: 12,
      name: 'Sadia Malik',
      rating: 5,
      date: '2023-12-18',
      product: 'Collagen Boosting Serum',
      review: 'Excellent product! My skin feels firmer and more elastic. The serum is lightweight and works great. Will definitely buy again!',
      verified: true,
    },
  ];

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(review => review.rating === parseInt(filter));

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'oldest') {
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'highest') {
      return b.rating - a.rating;
    } else if (sortBy === 'lowest') {
      return a.rating - b.rating;
    }
    return 0;
  });

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Customer Reviews
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              See what our customers are saying about our products. 
              Real reviews from real customers who trust Looklify.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Rating Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-8">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mb-2">
                  {renderStars(Math.round(averageRating))}
                </div>
                <div className="text-sm text-gray-600">
                  Based on {reviews.length} reviews
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingDistribution[rating];
                  const percentage = (count / reviews.length) * 100;
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm text-gray-600">{rating}</span>
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-3">
            {/* Filters and Sort */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {filters.map((filterOption) => (
                    <button
                      key={filterOption.id}
                      onClick={() => setFilter(filterOption.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filter === filterOption.id
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filterOption.name}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="space-y-6">
              {sortedReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">{review.name}</h3>
                        {review.verified && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                      </div>
                      <p className="text-sm text-purple-600 font-medium mb-3">
                        {review.product}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{review.review}</p>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {sortedReviews.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No reviews found</h3>
                <p className="text-gray-600 mb-6">Try selecting a different filter.</p>
                <button
                  onClick={() => setFilter('all')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Show All Reviews
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 lg:p-12 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Share Your Experience
            </h2>
            <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
              Have you purchased from Looklify? We'd love to hear about your experience! 
              Your reviews help other customers make informed decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="px-6 py-3 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
              >
                Shop Now
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

