'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function FAQPage() {
  const [openSection, setOpenSection] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'orders', name: 'Orders' },
    { id: 'shipping', name: 'Shipping & Delivery' },
    { id: 'returns', name: 'Returns & Refunds' },
    { id: 'products', name: 'Products' },
    { id: 'account', name: 'Account & Payment' },
  ];

  const faqItems = [
    {
      category: 'orders',
      question: 'How do I place an order?',
      answer: 'Placing an order is easy! Simply browse our products, add items to your cart, and proceed to checkout. You\'ll need to provide your shipping address and payment information. Once your order is confirmed, you\'ll receive an email confirmation with your order details.',
    },
    {
      category: 'orders',
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel your order before it ships. Once the order has been shipped, you\'ll need to follow our return process. To cancel an order, please contact us as soon as possible with your order number. We\'ll process your cancellation and refund within 1-2 business days.',
    },
    {
      category: 'orders',
      question: 'How do I track my order?',
      answer: 'Once your order ships, you\'ll receive an email with a tracking number. You can use this tracking number to track your order on our website or the shipping carrier\'s website. You can also log in to your account and view your order history for tracking information.',
    },
    {
      category: 'orders',
      question: 'Can I modify my order after placing it?',
      answer: 'If you need to modify your order, please contact us immediately. We may be able to make changes if your order hasn\'t been processed yet. Once your order is being processed or has shipped, we cannot modify it. In such cases, you can return the items following our return policy.',
    },
    {
      category: 'orders',
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including credit cards, debit cards, mobile banking, and other payment gateways. All payments are processed securely through our payment partners. You can see available payment options at checkout.',
    },
    {
      category: 'shipping',
      question: 'How long does shipping take?',
      answer: 'Shipping times vary depending on your location and the shipping method selected. Standard shipping typically takes 5-7 business days, express shipping takes 2-3 business days, and same-day delivery is available for select areas in Dhaka. Estimated delivery times are provided at checkout.',
    },
    {
      category: 'shipping',
      question: 'Do you offer free shipping?',
      answer: 'Yes! We offer free standard shipping on orders over ৳2,000 within Bangladesh. Free shipping applies to standard shipping only and excludes express and same-day delivery options. Shipping costs are displayed at checkout before you complete your purchase.',
    },
    {
      category: 'shipping',
      question: 'What if my package is lost or damaged?',
      answer: 'If your package is lost or damaged during shipping, please contact us immediately within 48 hours of receiving the package. Provide photos of the damage if possible and include your order number. We\'ll arrange for a replacement or full refund at no cost to you.',
    },
    {
      category: 'shipping',
      question: 'Can I change my delivery address?',
      answer: 'If you need to change your delivery address after placing an order, please contact us immediately. We may be able to update the address if your order hasn\'t shipped yet. Once your order has shipped, we cannot change the delivery address.',
    },
    {
      category: 'shipping',
      question: 'Do you ship internationally?',
      answer: 'Currently, we only ship within Bangladesh. We are working on expanding our shipping services to international destinations. Please check back with us or contact us for updates on international shipping availability.',
    },
    {
      category: 'returns',
      question: 'How do I return an item?',
      answer: 'To return an item, contact us via email or phone with your order number and reason for return. Our customer service team will review your request and provide a Return Authorization Number (RAN). Package the item securely in its original packaging and ship it to the address provided. Once we receive and inspect the item, we\'ll process your refund within 5-7 business days.',
    },
    {
      category: 'returns',
      question: 'How long do I have to return an item?',
      answer: 'You have 7 days from the date of delivery to initiate a return request. Items must be unused, unopened, and in their original packaging with all tags and accessories. For hygiene reasons, opened personal care items cannot be returned unless defective.',
    },
    {
      category: 'returns',
      question: 'Who pays for return shipping?',
      answer: 'For regular returns, the customer is responsible for return shipping costs. However, if the item is defective, damaged, or we made an error, we cover the return shipping costs. Original shipping charges will be deducted from your refund amount for regular returns.',
    },
    {
      category: 'returns',
      question: 'How long does it take to process a refund?',
      answer: 'Once we receive and inspect your returned item, we process refunds within 5-7 business days. The refund will be issued to the original payment method used for the purchase. Refund processing times may vary depending on your bank or payment provider.',
    },
    {
      category: 'returns',
      question: 'Can I return opened products?',
      answer: 'For hygiene and safety reasons, we cannot accept returns on opened skincare or beauty products unless they are defective or damaged. Items must be unused, unopened, and in their original packaging to be eligible for return.',
    },
    {
      category: 'products',
      question: 'Are your products authentic?',
      answer: 'Yes! We guarantee that all products sold on our website are 100% authentic. We source our products directly from trusted manufacturers and authorized distributors. We take product authenticity very seriously and stand behind the quality of every product we sell.',
    },
    {
      category: 'products',
      question: 'How do I choose the right product for my skin type?',
      answer: 'Our team of beauty experts can help you find the perfect products for your skin type. You can browse our product descriptions, read reviews, or contact our customer service team for personalized recommendations. We also provide detailed product information including ingredients and usage instructions.',
    },
    {
      category: 'products',
      question: 'Do you offer product samples?',
      answer: 'We occasionally offer product samples with purchases or during special promotions. Check our website regularly for sample offers. You can also contact us to inquire about sample availability for specific products.',
    },
    {
      category: 'products',
      question: 'What if I have an allergic reaction to a product?',
      answer: 'If you experience an allergic reaction to a product, stop using it immediately and consult a healthcare professional if needed. Contact us with your order number and details about the reaction. We\'ll work with you to resolve the issue, which may include a return and refund.',
    },
    {
      category: 'products',
      question: 'How do I know if a product is suitable for my skin?',
      answer: 'We recommend checking the product description for ingredients and usage instructions. If you have specific concerns or allergies, please review the ingredient list carefully. You can also contact our customer service team for personalized recommendations based on your skin type and concerns.',
    },
    {
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Creating an account is easy! Click on "Sign Up" in the top navigation, fill in your information (name, email, password), and verify your email address. Having an account allows you to track orders, save your address, and access exclusive offers.',
    },
    {
      category: 'account',
      question: 'I forgot my password. How do I reset it?',
      answer: 'If you forgot your password, click on "Forgot Password" on the login page. Enter your email address, and we\'ll send you a password reset link. Follow the instructions in the email to reset your password. If you don\'t receive the email, check your spam folder or contact us.',
    },
    {
      category: 'account',
      question: 'How do I update my account information?',
      answer: 'You can update your account information by logging into your account and going to your profile settings. You can update your name, email address, phone number, shipping address, and password. Make sure to save your changes after updating.',
    },
    {
      category: 'account',
      question: 'Is my payment information secure?',
      answer: 'Yes, your payment information is secure. We use industry-standard encryption and secure payment processing through trusted payment partners. We do not store your full credit card information on our servers. All payment transactions are processed securely.',
    },
    {
      category: 'account',
      question: 'Can I view my order history?',
      answer: 'Yes! Once you log into your account, you can view your complete order history, including past orders, current orders, and their status. You can also track your orders and view order details, including items purchased, shipping information, and tracking numbers.',
    },
  ];

  const filteredFAQs = activeCategory === 'all' 
    ? faqItems 
    : faqItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our products, services, shipping, returns, and more. 
              Can't find what you're looking for? Contact us and we'll be happy to help!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for questions..."
              className="w-full px-6 py-4 pl-14 rounded-xl text-gray-900 bg-white border-2 border-purple-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:outline-none shadow-sm"
              onChange={(e) => {
                // Simple search functionality - you can enhance this
                const searchTerm = e.target.value.toLowerCase();
                // This is a basic implementation - you might want to add more sophisticated search
              }}
            />
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-16">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4 flex-1">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      openSection === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSection === index && (
                  <div className="px-6 pb-5 border-t border-gray-100 pt-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600 mb-6">Try selecting a different category or contact us for assistance.</p>
              <Link
                href="/contact"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Contact Us
              </Link>
            </div>
          )}
        </div>

        {/* Still Have Questions Section */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 lg:p-12 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our customer service team is here to help! 
              Contact us and we'll get back to you as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:looklify.official@gmail.com"
                className="px-6 py-3 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
              >
                Email Us
              </a>
              <a
                href="tel:01866414126"
                className="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-all"
              >
                Call Us
              </a>
              <Link
                href="/contact"
                className="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-all"
              >
                Contact Form
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Related Pages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/shipping-delivery"
              className="bg-white rounded-lg border border-purple-200 p-4 hover:border-purple-400 hover:shadow-md transition-all text-center"
            >
              <div className="text-purple-600 font-semibold mb-1">Shipping & Delivery</div>
              <div className="text-sm text-gray-600">Delivery information</div>
            </Link>
            <Link
              href="/return-refund"
              className="bg-white rounded-lg border border-purple-200 p-4 hover:border-purple-400 hover:shadow-md transition-all text-center"
            >
              <div className="text-purple-600 font-semibold mb-1">Returns & Refunds</div>
              <div className="text-sm text-gray-600">Return policy</div>
            </Link>
            <Link
              href="/customer-services"
              className="bg-white rounded-lg border border-purple-200 p-4 hover:border-purple-400 hover:shadow-md transition-all text-center"
            >
              <div className="text-purple-600 font-semibold mb-1">Customer Services</div>
              <div className="text-sm text-gray-600">Get support</div>
            </Link>
            <Link
              href="/contact"
              className="bg-white rounded-lg border border-purple-200 p-4 hover:border-purple-400 hover:shadow-md transition-all text-center"
            >
              <div className="text-purple-600 font-semibold mb-1">Contact Us</div>
              <div className="text-sm text-gray-600">Get in touch</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

