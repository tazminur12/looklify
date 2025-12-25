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
    <section className="pt-4 pb-1 sm:py-10 bg-white mb-1 sm:mb-8 border-t border-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-8 sm:gap-6 lg:gap-0">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start lg:justify-center gap-3 sm:gap-4 group ${index === 4 ? 'col-span-2 md:col-span-1 lg:col-span-1' : ''}`}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-tight group-hover:text-purple-700 transition-colors">
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
