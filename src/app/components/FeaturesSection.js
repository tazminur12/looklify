'use client';

import { Truck, CreditCard, Headphones, ShieldCheck, RotateCcw } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Truck,
      title: "FAST SHIPPING",
      subtitle: "All Over Bangladesh"
    },
    {
      icon: CreditCard,
      title: "ONLINE PAYMENT",
      subtitle: "Payment Methods"
    },
    {
      icon: Headphones,
      title: "24/7 SUPPORT",
      subtitle: "Unlimited Help Desk"
    },
    {
      icon: ShieldCheck,
      title: "100% SAFE",
      subtitle: "Get Authentic Products"
    },
    {
      icon: RotateCcw,
      title: "FREE RETURNS",
      subtitle: "Track Or Off Orders"
    }
  ];

  return (
    <section className="py-5 sm:py-12 bg-gradient-to-b from-white mb-0 sm:mb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-2 sm:gap-6 lg:gap-0">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className={`flex items-center justify-center sm:justify-start lg:justify-center gap-3 sm:gap-4 group hover:transform hover:scale-105 transition-all duration-300 ${index === 4 ? 'col-span-2 md:col-span-1 lg:col-span-1' : ''}`}
              >
                <div className="p-2 sm:p-3 rounded-full bg-gray-50 group-hover:bg-purple-50 transition-colors duration-300">
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700 group-hover:text-purple-600 transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm sm:text-base font-bold text-blue-900 uppercase tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    {feature.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
