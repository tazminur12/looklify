import Link from "next/link";

export default function FeaturedCategories() {
  const featuredCategories = [
    { name: 'Skin Care', icon: '🧴', href: '/shop/skin-care' },
    { name: 'Hair Care', icon: '💇‍♀️', href: '/shop/hair-care' },
    { name: 'Lip Care', icon: '💄', href: '/shop/lip-care' },
    { name: 'Eye Care', icon: '👁️', href: '/shop/eye-care' },
    { name: 'Body Care', icon: '🧽', href: '/shop/body-care' },
    { name: 'Facial Care', icon: '✨', href: '/shop/facial-care' },
    { name: 'Teeth Care', icon: '🦷', href: '/shop/teeth-care' },
    { name: 'Health & Beauty', icon: '🌿', href: '/shop/health-beauty' },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Categories</h2>
          <p className="text-lg text-gray-600">Discover our carefully curated selection of beauty products</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {featuredCategories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group bg-white rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
