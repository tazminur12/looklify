'use client';

import { useState, useEffect } from 'react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // WhatsApp and Messenger links - Update these with your actual links
  const whatsappNumber = '+8801866411426'; // Replace with your WhatsApp number (without +)
  const messengerUsername = 'looklifybd'; // Replace with your Facebook page username

  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const messengerUrl = `https://m.me/${messengerUsername}`;

  // Close widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const widget = document.getElementById('chat-widget');
      const button = document.getElementById('chat-widget-button');
      if (isOpen && widget && !widget.contains(event.target) && !button?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <style jsx>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/* Chat Widget Button */}
      <button
        id="chat-widget-button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        aria-label="Open chat options"
      >
        {!isOpen ? (
          <svg
            className="w-6 h-6 text-white transition-transform group-hover:rotate-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-white transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-purple-600 animate-ping opacity-20"></span>
      </button>

      {/* Chat Options Panel */}
      {isOpen && (
        <div
          id="chat-widget"
          className="fixed bottom-24 right-6 z-50 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300"
          style={{
            animation: 'slideUpFade 0.3s ease-out forwards',
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
            <h3 className="font-semibold text-lg">How can we help you?</h3>
            <p className="text-sm text-purple-100 mt-1">Choose a way to contact us</p>
          </div>

          {/* Options */}
          <div className="p-4 space-y-3">
    

            {/* Messenger Option */}
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 group border border-blue-200 dark:border-blue-800"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" viewBox="0 0 16 16" className="w-7 h-7">
                  <path fill="#1E88E5" d="M8 0C3.582 0 0 3.316 0 7.407c0 2.331 1.163 4.41 2.981 5.768V16l2.724-1.495c.727.201 1.497.31 2.295.31 4.418 0 8-3.316 8-7.407C16 3.316 12.418 0 8 0z"></path>
                  <path fill="#FAFAFA" d="M8.795 9.975 6.758 7.802 2.783 9.975l4.372-4.642 2.087 2.173 3.926-2.173z"></path>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white">Messenger</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">Chat with us on Messenger</p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
            {/* WhatsApp Option */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 group border border-green-200 dark:border-green-800"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white">WhatsApp</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">Chat with us on WhatsApp</p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              We typically reply within a few minutes
            </p>
          </div>
        </div>
      )}
    </>
  );
}

