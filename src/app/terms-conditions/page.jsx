'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TermsConditionsPage() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const terms = [
    {
      title: 'Acceptance of Terms',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            By accessing and using the Looklify website and services, you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
          <p className="text-gray-600 leading-relaxed">
            These Terms and Conditions ("Terms") govern your use of our website located at Looklify and our services. 
            By using our website, you agree to comply with and be bound by these Terms.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to update, change, or replace any part of these Terms at any time. 
            It is your responsibility to check this page periodically for changes. Your continued use of the website 
            following the posting of any changes constitutes acceptance of those changes.
          </p>
        </div>
      ),
    },
    {
      title: 'Use of Website',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            You may use our website for lawful purposes only. You agree not to use the website:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>In any way that violates any applicable national or international law or regulation</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
            <li>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
            <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the website</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to terminate or suspend your access to our website immediately, without prior notice or liability, 
            for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </div>
      ),
    },
    {
      title: 'Products and Services',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We strive to provide accurate product descriptions, images, and pricing information. However, we do not warrant that 
            product descriptions or other content on this site is accurate, complete, reliable, current, or error-free.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>All products are subject to availability. We reserve the right to discontinue any product at any time</li>
            <li>We reserve the right to refuse any order you place with us</li>
            <li>We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order</li>
            <li>Prices for our products are subject to change without notice</li>
            <li>We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            We guarantee that all products sold on our website are 100% authentic and sourced from authorized distributors 
            and manufacturers. We take product authenticity very seriously.
          </p>
        </div>
      ),
    },
    {
      title: 'Pricing and Payment',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            All prices displayed on our website are in the currency specified and are subject to change without notice. 
            We reserve the right to correct any pricing errors, even after an order has been placed.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Payment must be received before we ship your order</li>
            <li>We accept various payment methods including credit cards, debit cards, and other payment gateways</li>
            <li>All payments are processed securely through our payment partners</li>
            <li>You agree to provide current, complete, and accurate purchase and account information for all purchases</li>
            <li>You agree to promptly update your account and other information, including your email address and credit card numbers, 
                so that we can complete your transactions and contact you as needed</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            If your payment method is declined, we reserve the right to cancel your order. You are responsible for any fees 
            charged by your financial institution in connection with your purchase.
          </p>
        </div>
      ),
    },
    {
      title: 'Shipping and Delivery',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We ship products to the address you provide during checkout. You are responsible for ensuring that the shipping 
            address is correct and complete.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Shipping costs and delivery times vary depending on your location and the shipping method selected</li>
            <li>We are not responsible for delays caused by customs, weather, or other circumstances beyond our control</li>
            <li>Risk of loss and title for products purchased from us pass to you upon delivery to the carrier</li>
            <li>You are responsible for any customs duties, taxes, or fees that may apply to your order</li>
            <li>If your order is lost or damaged during shipping, please contact us immediately</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            Estimated delivery times are provided for reference only and are not guaranteed. We are not liable for any 
            delays in delivery beyond our control.
          </p>
        </div>
      ),
    },
    {
      title: 'Returns and Refunds',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Our return and refund policy is designed to ensure your satisfaction. Please review our detailed Return & Refund Policy 
            for complete information.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Returns must be initiated within 7 days of receiving the product</li>
            <li>Items must be unused, unopened, and in their original packaging</li>
            <li>For hygiene reasons, opened personal care items cannot be returned unless defective</li>
            <li>Refunds will be processed to the original payment method within 5-7 business days</li>
            <li>Shipping costs are non-refundable unless the item was defective or we made an error</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            For more detailed information, please visit our{' '}
            <Link href="/return-refund" className="text-purple-600 hover:text-purple-700 underline">
              Return & Refund Policy
            </Link>{' '}
            page.
          </p>
        </div>
      ),
    },
    {
      title: 'User Accounts',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
            You are responsible for safeguarding the password and for all activities that occur under your account.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>You must not share your account credentials with anyone</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
            <li>You are responsible for maintaining the confidentiality of your account and password</li>
            <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
            <li>You may not use a false email address or impersonate any person or entity</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel orders at our sole discretion.
          </p>
        </div>
      ),
    },
    {
      title: 'Intellectual Property',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            The website and its original content, features, and functionality are owned by Looklify and are protected by international 
            copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise exploit any content 
                from our website without our prior written permission</li>
            <li>All trademarks, service marks, and trade names are proprietary to Looklify or their respective owners</li>
            <li>Product images and descriptions are for illustrative purposes only and may not exactly match the actual product</li>
            <li>You may not use our logo or other proprietary graphics without our express written permission</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            Any unauthorized use of our intellectual property may result in legal action.
          </p>
        </div>
      ),
    },
    {
      title: 'Privacy Policy',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information 
            when you use our website and services.
          </p>
          <p className="text-gray-600 leading-relaxed">
            By using our website, you consent to the collection and use of information in accordance with our Privacy Policy. 
            Please review our{' '}
            <Link href="/privacy-policy" className="text-purple-600 hover:text-purple-700 underline">
              Privacy Policy
            </Link>{' '}
            to understand our practices.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>We collect information that you provide directly to us, such as when you create an account or make a purchase</li>
            <li>We use cookies and similar technologies to enhance your experience</li>
            <li>We do not sell your personal information to third parties</li>
            <li>We implement security measures to protect your personal information</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Limitation of Liability',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            To the fullest extent permitted by applicable law, Looklify shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any 
            loss of data, use, goodwill, or other intangible losses.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Our total liability to you for all claims arising from or related to the use of our website shall not exceed 
                the amount you paid to us in the 12 months preceding the claim</li>
            <li>We are not liable for any damages resulting from your use or inability to use our website</li>
            <li>We are not responsible for any third-party content, products, or services available through our website</li>
            <li>We do not warrant that our website will be available, uninterrupted, secure, or error-free</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of liability for 
            incidental or consequential damages. Accordingly, some of the above limitations may not apply to you.
          </p>
        </div>
      ),
    },
    {
      title: 'Indemnification',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            You agree to defend, indemnify, and hold harmless Looklify and its officers, directors, employees, and agents from and 
            against any claims, liabilities, damages, losses, and expenses, including without limitation reasonable legal and accounting 
            fees, arising out of or in any way connected with your access to or use of the website or your violation of these Terms.
          </p>
        </div>
      ),
    },
    {
      title: 'Governing Law',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of Bangladesh, without regard to its conflict 
            of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive 
            jurisdiction of the courts of Bangladesh.
          </p>
        </div>
      ),
    },
    {
      title: 'Changes to Terms',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, 
            we will try to provide at least 30 days notice prior to any new terms taking effect.
          </p>
          <p className="text-gray-600 leading-relaxed">
            What constitutes a material change will be determined at our sole discretion. By continuing to access or use our website 
            after any revisions become effective, you agree to be bound by the revised terms.
          </p>
          <p className="text-gray-600 leading-relaxed">
            If you do not agree to the new terms, you must stop using the website and may close your account.
          </p>
        </div>
      ),
    },
    {
      title: 'Contact Information',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            If you have any questions about these Terms and Conditions, please contact us:
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
            <p className="text-gray-700">
              <strong>Email:</strong>{' '}
              <a href="mailto:looklify.official@gmail.com" className="text-purple-600 hover:text-purple-700">
                looklify.official@gmail.com
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong>{' '}
              <a href="tel:01866414126" className="text-purple-600 hover:text-purple-700">
                01866414126
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Address:</strong> Dhaka, Bangladesh
            </p>
          </div>
          <p className="text-gray-600 leading-relaxed">
            You can also visit our{' '}
            <Link href="/contact" className="text-purple-600 hover:text-purple-700 underline">
              Contact Us
            </Link>{' '}
            page for more ways to reach us.
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
              Terms and Conditions
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Please read these terms and conditions carefully before using our website and services. 
              By using our website, you agree to be bound by these terms.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-12 shadow-sm">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              Welcome to Looklify. These Terms and Conditions ("Terms") govern your access to and use of our website, 
              products, and services. By accessing or using our website, you agree to be bound by these Terms.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              If you disagree with any part of these Terms, then you may not access the website or use our services. 
              Please read these Terms carefully before making a purchase or using our website.
            </p>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6 mb-16">
          {terms.map((term, index) => (
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
                  {term.title}
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
                  {term.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Agreement Section */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-8 mb-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Agreement to Terms
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6">
              By accessing and using the Looklify website, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms and Conditions. If you do not agree to these Terms, 
              please do not use our website or services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Contact Us
              </Link>
              <Link
                href="/privacy-policy"
                className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-all"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-yellow-900 mb-2">
                Important Notice
              </h3>
              <p className="text-yellow-800 text-sm leading-relaxed">
                These Terms and Conditions may be updated from time to time. We recommend that you review this page 
                periodically to stay informed of any changes. Your continued use of our website after any changes 
                constitutes acceptance of the updated Terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

