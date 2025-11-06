'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ReturnRefundPage() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const returnPolicy = [
    {
      title: 'Eligibility for Returns',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            To be eligible for a return, your item must meet the following conditions:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>The item must be unused, unopened, and in its original packaging</li>
            <li>The item must be in the same condition as when you received it</li>
            <li>You must initiate the return within 7 days of receiving the product</li>
            <li>The item must have all original tags, labels, and accessories</li>
            <li>You must provide proof of purchase (order number or receipt)</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Non-Returnable Items',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            For hygiene and safety reasons, the following items cannot be returned:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Opened or used skincare and beauty products</li>
            <li>Personal care items that have been opened</li>
            <li>Items without original packaging or tags</li>
            <li>Items damaged due to misuse or negligence</li>
            <li>Customized or personalized products</li>
            <li>Items purchased during special sales or clearance (unless defective)</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Return Process',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Follow these simple steps to return an item:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-gray-600 ml-4">
            <li>
              <strong className="text-gray-900">Contact Us:</strong> Email us at{' '}
              <a href="mailto:looklify.official@gmail.com" className="text-purple-600 hover:text-purple-700">
                looklify.official@gmail.com
              </a>{' '}
              or call us at{' '}
              <a href="tel:01866414126" className="text-purple-600 hover:text-purple-700">
                01866414126
              </a>{' '}
              with your order number and reason for return
            </li>
            <li>
              <strong className="text-gray-900">Get Authorization:</strong> Our customer service team will review your request and provide a Return Authorization Number (RAN)
            </li>
            <li>
              <strong className="text-gray-900">Package the Item:</strong> Securely package the item in its original packaging with all accessories and tags
            </li>
            <li>
              <strong className="text-gray-900">Ship the Item:</strong> Send the package to the address provided by our team. Include the RAN on the package
            </li>
            <li>
              <strong className="text-gray-900">Receive Refund:</strong> Once we receive and inspect the item, we'll process your refund within 5-7 business days
            </li>
          </ol>
        </div>
      ),
    },
    {
      title: 'Refund Policy',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We offer full refunds for eligible returns. Here's what you need to know:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Refunds will be issued to the original payment method used for the purchase</li>
            <li>Processing time: 5-7 business days after we receive and inspect the returned item</li>
            <li>Shipping costs are non-refundable unless the item was defective or we made an error</li>
            <li>Original shipping charges will be deducted from the refund amount</li>
            <li>For defective or damaged items, we'll cover return shipping costs</li>
          </ul>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Refund processing times may vary depending on your bank or payment provider. 
              Please allow additional time for the refund to appear in your account.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Exchange Policy',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We currently do not offer direct exchanges. However, you can:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Return the item following our return process</li>
            <li>Place a new order for the item you want</li>
            <li>We'll process your refund once the return is received and approved</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-4">
            This process ensures you get the exact product you want while maintaining our quality standards.
          </p>
        </div>
      ),
    },
    {
      title: 'Damaged or Defective Items',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            If you receive a damaged or defective item, please contact us immediately:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Contact us within 48 hours of receiving the item</li>
            <li>Provide photos of the damage or defect</li>
            <li>We'll arrange for a replacement or full refund at no cost to you</li>
            <li>We'll cover return shipping for damaged or defective items</li>
            <li>Your replacement will be shipped immediately upon approval</li>
          </ul>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-red-800">
              <strong>Important:</strong> Please inspect your order upon delivery. If items are damaged or defective, 
              contact us immediately to ensure a quick resolution.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const faqItems = [
    {
      question: 'How long do I have to return an item?',
      answer: 'You have 7 days from the date of delivery to initiate a return request.',
    },
    {
      question: 'Who pays for return shipping?',
      answer: 'For regular returns, the customer is responsible for return shipping costs. However, if the item is defective or we made an error, we cover the return shipping.',
    },
    {
      question: 'Can I return opened products?',
      answer: 'For hygiene and safety reasons, we cannot accept returns on opened skincare or beauty products unless they are defective or damaged.',
    },
    {
      question: 'How long does it take to process a refund?',
      answer: 'Once we receive and inspect your returned item, we process refunds within 5-7 business days. The refund will appear in your account depending on your bank or payment provider.',
    },
    {
      question: 'What if I receive the wrong item?',
      answer: 'If you receive the wrong item, contact us immediately. We\'ll arrange for the correct item to be shipped to you at no additional cost, and we\'ll cover return shipping for the incorrect item.',
    },
    {
      question: 'Can I cancel my order?',
      answer: 'You can cancel your order before it ships. Once the order has been shipped, you\'ll need to follow our return process. Contact us as soon as possible if you wish to cancel.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Return & Refund Policy
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Your satisfaction is our priority. Learn about our return and refund policies 
              to ensure a smooth shopping experience.
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">7 Days Return</h3>
              <p className="text-sm text-gray-600">Return eligible items within 7 days of delivery</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Easy Process</h3>
              <p className="text-sm text-gray-600">Simple return process with customer support</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Refund</h3>
              <p className="text-sm text-gray-600">Refunds processed within 5-7 business days</p>
            </div>
          </div>
        </div>

        {/* Return Policy Sections */}
        <div className="space-y-6 mb-16">
          {returnPolicy.map((policy, index) => (
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
                  {policy.title}
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
                  {policy.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(`faq-${index}`)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      openSection === `faq-${index}` ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSection === `faq-${index}` && (
                  <div className="px-6 pb-4 border-t border-gray-100 pt-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 lg:p-12 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Need Help with Your Return?
            </h2>
            <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
              Our customer service team is here to help you with any questions about returns or refunds. 
              Contact us and we'll assist you promptly.
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
                <li>• Please keep your order number and receipt for reference</li>
                <li>• Returns must be in original, unopened condition unless defective</li>
                <li>• We reserve the right to refuse returns that don't meet our policy requirements</li>
                <li>• For hygiene reasons, opened personal care items cannot be returned</li>
                <li>• Refunds will be issued to the original payment method</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

