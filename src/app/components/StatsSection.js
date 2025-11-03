'use client';

import { useState, useEffect, useRef } from 'react';

export default function StatsSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [happyCustomers, setHappyCustomers] = useState(0);
  const [premiumProducts, setPremiumProducts] = useState(0);
  const [brandPartners, setBrandPartners] = useState(0);
  const sectionRef = useRef(null);

  // Target values
  const targets = {
    customers: 10000,
    products: 500,
    partners: 50
  };

  // Intersection Observer to trigger animation when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCounts();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCounts = () => {
    // Animation duration in milliseconds
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    // Happy Customers animation (10K)
    let customersStep = targets.customers / steps;
    let customersInterval = setInterval(() => {
      setHappyCustomers((prev) => {
        const next = prev + customersStep;
        if (next >= targets.customers) {
          clearInterval(customersInterval);
          return targets.customers;
        }
        return next;
      });
    }, stepDuration);

    // Premium Products animation (500)
    let productsStep = targets.products / steps;
    let productsInterval = setInterval(() => {
      setPremiumProducts((prev) => {
        const next = prev + productsStep;
        if (next >= targets.products) {
          clearInterval(productsInterval);
          return targets.products;
        }
        return next;
      });
    }, stepDuration);

    // Brand Partners animation (50)
    let partnersStep = targets.partners / steps;
    let partnersInterval = setInterval(() => {
      setBrandPartners((prev) => {
        const next = prev + partnersStep;
        if (next >= targets.partners) {
          clearInterval(partnersInterval);
          return targets.partners;
        }
        return next;
      });
    }, stepDuration);
  };

  return (
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {hasAnimated ? Math.floor(happyCustomers).toLocaleString() + '+' : '0'}
            </div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {hasAnimated ? Math.floor(premiumProducts) + '+' : '0'}
            </div>
            <div className="text-gray-600">Premium Products</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {hasAnimated ? Math.floor(brandPartners) + '+' : '0'}
            </div>
            <div className="text-gray-600">Brand Partners</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
            <div className="text-gray-600">Customer Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}
