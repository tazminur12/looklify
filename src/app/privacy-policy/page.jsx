'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function PrivacyPolicyPage() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const privacySections = [
    {
      title: 'Introduction',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            At Looklify, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our 
            website and use our services.
          </p>
          <p className="text-gray-600 leading-relaxed">
            By using our website, you consent to the collection and use of information in accordance with this Privacy Policy. 
            If you do not agree with our policies and practices, please do not use our website or services.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to update, change, or replace any part of this Privacy Policy at any time. 
            It is your responsibility to check this page periodically for changes. Your continued use of the website 
            following the posting of any changes constitutes acceptance of those changes.
          </p>
        </div>
      ),
    },
    {
      title: 'Information We Collect',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We collect information that you provide directly to us and information that is automatically collected when 
            you use our website. The types of information we collect include:
          </p>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Name, email address, phone number, and mailing address</li>
                <li>Payment information (credit card numbers, billing address)</li>
                <li>Account credentials (username, password)</li>
                <li>Order history and purchase information</li>
                <li>Preferences and interests</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Automatically Collected Information</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, links clicked)</li>
                <li>Location data (if you enable location services)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'How We Use Your Information',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li><strong className="text-gray-900">To Process Orders:</strong> To process and fulfill your orders, manage payments, and send order confirmations</li>
            <li><strong className="text-gray-900">To Provide Customer Service:</strong> To respond to your inquiries, provide support, and handle returns and refunds</li>
            <li><strong className="text-gray-900">To Improve Our Services:</strong> To analyze usage patterns, improve our website, and develop new features</li>
            <li><strong className="text-gray-900">To Send Communications:</strong> To send you updates about your orders, promotional offers, newsletters, and marketing communications (with your consent)</li>
            <li><strong className="text-gray-900">To Ensure Security:</strong> To detect, prevent, and address technical issues, fraud, and security threats</li>
            <li><strong className="text-gray-900">To Comply with Legal Obligations:</strong> To comply with applicable laws, regulations, and legal processes</li>
            <li><strong className="text-gray-900">To Personalize Your Experience:</strong> To customize content, recommendations, and advertisements based on your preferences</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Information Sharing and Disclosure',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We do not sell your personal information to third parties. However, we may share your information in the following circumstances:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li><strong className="text-gray-900">Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf, such as payment processing, shipping, data analysis, and customer service</li>
            <li><strong className="text-gray-900">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity</li>
            <li><strong className="text-gray-900">Legal Requirements:</strong> We may disclose information if required by law, court order, or government regulation, or to protect our rights and safety</li>
            <li><strong className="text-gray-900">With Your Consent:</strong> We may share information with your explicit consent or at your direction</li>
            <li><strong className="text-gray-900">Business Partners:</strong> We may share aggregated, non-personally identifiable information with business partners for analytics and marketing purposes</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            All third parties with whom we share information are required to maintain the confidentiality and security of your information 
            and are prohibited from using it for any purpose other than providing services to us.
          </p>
        </div>
      ),
    },
    {
      title: 'Data Security',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We implement appropriate technical and organizational security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Encryption of sensitive data during transmission and storage</li>
            <li>Secure payment processing through trusted payment gateways</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication mechanisms</li>
            <li>Employee training on data protection and privacy</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use 
            commercially acceptable means to protect your information, we cannot guarantee absolute security.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> You are responsible for maintaining the confidentiality of your account credentials. 
              Please do not share your password with anyone and notify us immediately if you suspect unauthorized access to your account.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Cookies and Tracking Technologies',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We use cookies and similar tracking technologies to collect and store information about your preferences and activities 
            on our website. Cookies are small text files that are placed on your device when you visit our website.
          </p>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Types of Cookies We Use</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li><strong className="text-gray-900">Essential Cookies:</strong> Required for the website to function properly (e.g., authentication, shopping cart)</li>
                <li><strong className="text-gray-900">Analytics Cookies:</strong> Help us understand how visitors use our website (e.g., Google Analytics)</li>
                <li><strong className="text-gray-900">Functional Cookies:</strong> Remember your preferences and settings (e.g., language, region)</li>
                <li><strong className="text-gray-900">Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign effectiveness</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Managing Cookies</h4>
              <p className="text-gray-600 leading-relaxed">
                You can control and manage cookies through your browser settings. However, disabling certain cookies may affect 
                the functionality of our website. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>View and delete cookies</li>
                <li>Block cookies from specific sites</li>
                <li>Block all cookies</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Your Rights and Choices',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            You have certain rights regarding your personal information. These rights may vary depending on your location, 
            but generally include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li><strong className="text-gray-900">Access:</strong> You have the right to request access to your personal information</li>
            <li><strong className="text-gray-900">Correction:</strong> You can update or correct your personal information through your account settings or by contacting us</li>
            <li><strong className="text-gray-900">Deletion:</strong> You can request deletion of your personal information, subject to certain legal obligations</li>
            <li><strong className="text-gray-900">Opt-Out:</strong> You can opt-out of marketing communications by clicking the unsubscribe link in our emails or contacting us</li>
            <li><strong className="text-gray-900">Data Portability:</strong> You can request a copy of your data in a portable format</li>
            <li><strong className="text-gray-900">Objection:</strong> You can object to certain processing of your personal information</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            To exercise these rights, please contact us using the contact information provided at the end of this Privacy Policy. 
            We will respond to your request within a reasonable timeframe.
          </p>
        </div>
      ),
    },
    {
      title: 'Data Retention',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, 
            unless a longer retention period is required or permitted by law. The retention period depends on:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>The nature of the information and the purpose for which it was collected</li>
            <li>Legal and regulatory requirements</li>
            <li>Our business needs and legitimate interests</li>
            <li>Your consent and preferences</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            When we no longer need your personal information, we will securely delete or anonymize it in accordance with our 
            data retention policies.
          </p>
        </div>
      ),
    },
    {
      title: 'Children\'s Privacy',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Our website is not intended for children under the age of 18. We do not knowingly collect personal information 
            from children under 18. If you are a parent or guardian and believe that your child has provided us with personal 
            information, please contact us immediately.
          </p>
          <p className="text-gray-600 leading-relaxed">
            If we become aware that we have collected personal information from a child under 18 without parental consent, 
            we will take steps to delete that information from our systems.
          </p>
        </div>
      ),
    },
    {
      title: 'Third-Party Links',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Our website may contain links to third-party websites, services, or applications that are not owned or controlled by us. 
            This Privacy Policy does not apply to third-party websites.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We are not responsible for the privacy practices or content of third-party websites. We encourage you to review the 
            privacy policies of any third-party websites you visit.
          </p>
        </div>
      ),
    },
    {
      title: 'International Data Transfers',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Your information may be transferred to and processed in countries other than your country of residence. These countries 
            may have data protection laws that differ from those in your country.
          </p>
          <p className="text-gray-600 leading-relaxed">
            By using our website, you consent to the transfer of your information to these countries. We take appropriate measures 
            to ensure that your information is protected in accordance with this Privacy Policy, regardless of where it is processed.
          </p>
        </div>
      ),
    },
    {
      title: 'Changes to This Privacy Policy',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, 
            or other factors. We will notify you of any material changes by:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Posting the updated Privacy Policy on this page</li>
            <li>Updating the "Last updated" date at the top of this page</li>
            <li>Sending you an email notification (if you have provided your email address)</li>
            <li>Displaying a prominent notice on our website</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            Your continued use of our website after any changes to this Privacy Policy constitutes acceptance of those changes. 
            We encourage you to review this Privacy Policy periodically.
          </p>
        </div>
      ),
    },
    {
      title: 'Contact Us',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
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
              Privacy Policy
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Your privacy is important to us. This Privacy Policy explains how we collect, use, 
              and protect your personal information when you use our website and services.
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
              At Looklify, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy describes our practices regarding the collection, use, and disclosure of information when you 
              use our website and services.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              By using our website, you agree to the collection and use of information in accordance with this Privacy Policy. 
              If you do not agree with our policies and practices, please do not use our website or services.
            </p>
          </div>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-6 mb-16">
          {privacySections.map((section, index) => (
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

        {/* Consent Section */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-8 mb-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Consent
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6">
              By using our website, you acknowledge that you have read, understood, and agree to this Privacy Policy. 
              If you do not agree to this Privacy Policy, please do not use our website or services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Contact Us
              </Link>
              <Link
                href="/terms-conditions"
                className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-all"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                Your Privacy Matters
              </h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                We take your privacy seriously and are committed to protecting your personal information. 
                If you have any questions or concerns about this Privacy Policy or our privacy practices, 
                please don't hesitate to contact us. We're here to help.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

