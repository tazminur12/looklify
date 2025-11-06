'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ShippingDeliveryPage() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const shippingMethods = [
    {
      name: 'Standard Shipping',
      duration: '5-7 Business Days',
      cost: '৳100 - ৳200',
      description: 'Standard shipping for orders within Bangladesh. Delivered to your doorstep.',
    },
    {
      name: 'Express Shipping',
      duration: '2-3 Business Days',
      cost: '৳300 - ৳500',
      description: 'Fast delivery option for urgent orders. Priority handling and faster transit.',
    },
    {
      name: 'Same Day Delivery',
      duration: 'Same Day',
      cost: '৳500 - ৳800',
      description: 'Available for select areas in Dhaka. Order before 12 PM for same-day delivery.',
    },
  ];

  const shippingSections = [
    {
      title: 'Shipping Information',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We offer fast and reliable shipping services to ensure your orders arrive safely and on time. 
            All orders are processed and shipped from our warehouse in Dhaka, Bangladesh.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Once your order is placed and payment is confirmed, we will process and ship your order as quickly as possible. 
            You will receive an email confirmation with your order details and tracking information once your order ships.
          </p>
        </div>
      ),
    },
    {
      title: 'Shipping Methods',
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed">
            We offer multiple shipping options to meet your needs:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shippingMethods.map((method, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2">{method.name}</h4>
                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <strong>Duration:</strong> {method.duration}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <strong>Cost:</strong> {method.cost}
                  </p>
                </div>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Delivery Times',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Delivery times vary depending on your location and the shipping method selected. 
            Estimated delivery times are provided at checkout and in your order confirmation email.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Estimated Delivery Times:</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Dhaka:</strong> 1-3 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Other Major Cities:</strong> 3-5 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Remote Areas:</strong> 5-7 business days</span>
              </li>
            </ul>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm">
            <strong>Note:</strong> Delivery times are estimates and may vary due to weather conditions, 
            holidays, or other circumstances beyond our control. We are not responsible for delays caused 
            by the shipping carrier or customs.
          </p>
        </div>
      ),
    },
    {
      title: 'Shipping Costs',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Shipping costs are calculated based on the weight of your order, shipping method selected, 
            and delivery location. Shipping costs are displayed at checkout before you complete your purchase.
          </p>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Free Shipping</h4>
            <p className="text-gray-600 leading-relaxed mb-3">
              We offer free standard shipping on orders over ৳2,000 within Bangladesh. 
              Free shipping applies to standard shipping only and excludes express and same-day delivery options.
            </p>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-gray-700">
                <strong>Free Shipping Eligibility:</strong> Orders of ৳2,000 or more qualify for free standard shipping.
              </p>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm">
            Shipping costs are non-refundable unless the item was defective or we made an error. 
            If you return an item, original shipping charges will be deducted from your refund amount.
          </p>
        </div>
      ),
    },
    {
      title: 'Order Processing',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Once you place an order, here's what happens:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-gray-600 ml-4">
            <li>
              <strong className="text-gray-900">Order Confirmation:</strong> You'll receive an email confirmation 
              with your order number and details immediately after placing your order
            </li>
            <li>
              <strong className="text-gray-900">Payment Processing:</strong> We process your payment securely through 
              our payment partners. Your order will be processed once payment is confirmed
            </li>
            <li>
              <strong className="text-gray-900">Order Processing:</strong> We prepare your order for shipment. 
              This typically takes 1-2 business days
            </li>
            <li>
              <strong className="text-gray-900">Shipping:</strong> Your order is shipped and you'll receive a 
              tracking number via email
            </li>
            <li>
              <strong className="text-gray-900">Delivery:</strong> Your order arrives at your specified address
            </li>
          </ol>
          <p className="text-gray-600 leading-relaxed">
            Processing times may vary during peak seasons, holidays, or promotional periods. 
            We'll notify you if there are any delays in processing your order.
          </p>
        </div>
      ),
    },
    {
      title: 'Order Tracking',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Once your order ships, you'll receive an email with a tracking number. You can use this tracking number 
            to track your order's progress through our website or the shipping carrier's website.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">How to Track Your Order:</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Check your email for the tracking number and link</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Log in to your account and view your order history</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Use the tracking number on the shipping carrier's website</span>
              </li>
            </ul>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm">
            Tracking information is typically available within 24-48 hours after your order ships. 
            If you have any questions about your order status, please contact us.
          </p>
        </div>
      ),
    },
    {
      title: 'Delivery Address',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Please ensure that your delivery address is correct and complete when placing your order. 
            We are not responsible for orders delivered to incorrect addresses provided by you.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Double-check your address before completing your order</li>
            <li>Include apartment numbers, building names, or other relevant details</li>
            <li>Provide a contact phone number for delivery coordination</li>
            <li>Update your address in your account settings if it changes</li>
          </ul>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> If you need to change your delivery address after placing an order, 
              please contact us immediately. We may be able to update the address if the order hasn't shipped yet.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Failed Delivery Attempts',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            If delivery is attempted but unsuccessful, the shipping carrier will typically:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Leave a notice at your address with instructions for rescheduling delivery</li>
            <li>Hold the package at a local facility for pickup</li>
            <li>Attempt delivery again on the next business day</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            If delivery fails multiple times, the package may be returned to us. In such cases, 
            we will contact you to arrange for redelivery or refund. Additional shipping charges may apply for redelivery.
          </p>
        </div>
      ),
    },
    {
      title: 'Damaged or Lost Packages',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            If your package arrives damaged or is lost during shipping, please contact us immediately:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Contact us within 48 hours of receiving a damaged package</li>
            <li>Provide photos of the damage if possible</li>
            <li>Include your order number and tracking information</li>
            <li>We'll arrange for a replacement or full refund at no cost to you</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            We work with reliable shipping partners to ensure safe delivery. However, if something goes wrong, 
            we're here to help resolve the issue quickly.
          </p>
        </div>
      ),
    },
    {
      title: 'International Shipping',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Currently, we only ship within Bangladesh. We are working on expanding our shipping services to 
            international destinations. Please check back with us or contact us for updates on international shipping availability.
          </p>
          <p className="text-gray-600 leading-relaxed">
            For international shipping inquiries, please contact us at{' '}
            <a href="mailto:looklify.official@gmail.com" className="text-purple-600 hover:text-purple-700">
              looklify.official@gmail.com
            </a>
            .
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Shipping & Delivery
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Fast and reliable shipping to get your favorite beauty products delivered to your doorstep. 
              Learn about our shipping methods, delivery times, and tracking options.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Quick Overview */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fast Processing</h3>
              <p className="text-sm text-gray-600">Orders processed within 1-2 business days</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Delivery</h3>
              <p className="text-sm text-gray-600">Multiple shipping options available</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Order Tracking</h3>
              <p className="text-sm text-gray-600">Track your order in real-time</p>
            </div>
          </div>
        </div>

        {/* Shipping Sections */}
        <div className="space-y-6 mb-16">
          {shippingSections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-purple-600 font-semibold text-sm">
                    {index + 1}
                  </span>
                  {section.title}
                </h2>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
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
                <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 lg:p-12 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Questions About Shipping?
            </h2>
            <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
              Our customer service team is here to help you with any questions about shipping, delivery, 
              or tracking your order. Contact us and we'll assist you promptly.
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

        {/* Important Notes */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-yellow-900 mb-2">
                Important Notes
              </h3>
              <ul className="space-y-2 text-yellow-800 text-sm">
                <li>• Delivery times are estimates and may vary due to weather, holidays, or other circumstances</li>
                <li>• Please ensure your delivery address is correct and complete</li>
                <li>• Someone must be available to receive the package at the delivery address</li>
                <li>• We are not responsible for delays caused by shipping carriers or customs</li>
                <li>• Contact us immediately if your package is damaged or lost during shipping</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

