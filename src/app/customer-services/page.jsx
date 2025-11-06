'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function CustomerServicesPage() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const services = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: '24/7 Support',
      description: 'Our customer service team is available around the clock to assist you with any questions or concerns.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Easy Returns',
      description: 'Simple and hassle-free return process. Return eligible items within 7 days of delivery.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping options to get your orders delivered to your doorstep.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Expert Advice',
      description: 'Get personalized recommendations from our team of beauty experts.',
    },
  ];

  const serviceSections = [
    {
      title: 'Our Commitment to You',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            At Looklify, customer satisfaction is our top priority. We are committed to providing exceptional 
            customer service and support throughout your shopping experience. Our dedicated customer service team 
            is here to help you with any questions, concerns, or issues you may have.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Whether you need help finding the right product, tracking your order, processing a return, or have 
            any other questions, we're here to assist you every step of the way.
          </p>
        </div>
      ),
    },
    {
      title: 'How to Contact Us',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We offer multiple ways to get in touch with our customer service team:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Email Support</h4>
              <p className="text-sm text-gray-600 mb-3">
                Send us an email and we'll respond within 24 hours
              </p>
              <a
                href="mailto:looklify.official@gmail.com"
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                looklify.official@gmail.com
              </a>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center text-white mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Phone Support</h4>
              <p className="text-sm text-gray-600 mb-3">
                Call us during business hours for immediate assistance
              </p>
              <a
                href="tel:01866414126"
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                01866414126
              </a>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Contact Form</h4>
              <p className="text-sm text-gray-600 mb-3">
                Fill out our contact form for detailed inquiries
              </p>
              <Link
                href="/contact"
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Visit Contact Page
              </Link>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Business Hours',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Our customer service team is available during the following hours:
          </p>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Monday - Friday</span>
                <span className="text-gray-600">9:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Saturday</span>
                <span className="text-gray-600">10:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Sunday</span>
                <span className="text-gray-600">Closed</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm">
            <strong>Note:</strong> Email inquiries are monitored 24/7, and we aim to respond within 24 hours. 
            For urgent matters, please call us during business hours.
          </p>
        </div>
      ),
    },
    {
      title: 'Services We Provide',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Our customer service team can assist you with:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Order tracking and status updates</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Product information and recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Returns and refunds</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Shipping and delivery inquiries</span>
              </li>
            </ul>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Account and payment issues</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Technical support</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Complaints and feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>General inquiries</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'Frequently Asked Questions',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Find answers to common questions about our products, services, and policies:
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-gray-700 mb-3">
              We've compiled answers to the most frequently asked questions to help you find information quickly. 
              Visit our FAQ page for detailed answers to common questions.
            </p>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              Visit FAQ Page
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      ),
    },
    {
      title: 'Order Support',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Need help with your order? We're here to assist you with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Tracking your order status</li>
            <li>Updating your delivery address</li>
            <li>Canceling or modifying your order</li>
            <li>Resolving delivery issues</li>
            <li>Handling damaged or missing items</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            For order-related inquiries, please have your order number ready when contacting us. 
            You can find your order number in your order confirmation email or in your account order history.
          </p>
        </div>
      ),
    },
    {
      title: 'Product Support',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Our team can help you with product-related questions and concerns:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Product recommendations based on your needs</li>
            <li>Usage instructions and tips</li>
            <li>Ingredient information</li>
            <li>Product compatibility questions</li>
            <li>Allergy and sensitivity concerns</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            Our beauty experts are trained to provide personalized recommendations and answer your product questions. 
            Don't hesitate to reach out if you need help finding the perfect products for your skincare and beauty routine.
          </p>
        </div>
      ),
    },
    {
      title: 'Feedback and Suggestions',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We value your feedback and suggestions! Your input helps us improve our products, services, and customer experience.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Whether you have a suggestion for new products, feedback about your shopping experience, or ideas for 
            improving our website, we'd love to hear from you. Please share your thoughts through:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Our contact form</li>
            <li>Email at looklify.official@gmail.com</li>
            <li>Phone at 01866414126</li>
            <li>Product reviews on our website</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            We review all feedback and suggestions regularly and use them to enhance our services and offerings.
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
              Customer Services
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              We're here to help! Our dedicated customer service team is committed to providing you with 
              exceptional support and assistance throughout your shopping experience.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Services Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Service Sections */}
        <div className="space-y-6 mb-16">
          {serviceSections.map((section, index) => (
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

        {/* Quick Links */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/contact"
              className="bg-white rounded-lg border border-purple-200 p-4 hover:border-purple-400 hover:shadow-md transition-all text-center"
            >
              <div className="text-purple-600 font-semibold mb-1">Contact Us</div>
              <div className="text-sm text-gray-600">Get in touch</div>
            </Link>
            <Link
              href="/faq"
              className="bg-white rounded-lg border border-purple-200 p-4 hover:border-purple-400 hover:shadow-md transition-all text-center"
            >
              <div className="text-purple-600 font-semibold mb-1">FAQ</div>
              <div className="text-sm text-gray-600">Common questions</div>
            </Link>
            <Link
              href="/return-refund"
              className="bg-white rounded-lg border border-purple-200 p-4 hover:border-purple-400 hover:shadow-md transition-all text-center"
            >
              <div className="text-purple-600 font-semibold mb-1">Returns</div>
              <div className="text-sm text-gray-600">Return policy</div>
            </Link>
            <Link
              href="/shipping-delivery"
              className="bg-white rounded-lg border border-purple-200 p-4 hover:border-purple-400 hover:shadow-md transition-all text-center"
            >
              <div className="text-purple-600 font-semibold mb-1">Shipping</div>
              <div className="text-sm text-gray-600">Delivery info</div>
            </Link>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 lg:p-12 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Need Help? We're Here for You!
            </h2>
            <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
              Our customer service team is ready to assist you with any questions or concerns. 
              Don't hesitate to reach out - we're here to help!
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
      </div>
    </div>
  );
}

