import ImageSlider from "./components/ImageSlider";
import FeaturesSection from "./components/FeaturesSection";
import FeaturedCategories from "./components/FeaturedCategories";
import FeaturedProducts from "./components/FeaturedProducts";
import StatsSection from "./components/StatsSection";
import CTASection from "./components/CTASection";

export default function Home() {

  return (
    <div className="min-h-screen">
      {/* Hero Section - Image Background */}
      <section className="relative h-[60vh] sm:h-[65vh] lg:h-[70vh] w-full">
        <ImageSlider />
      </section>

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Stats Section */}
      <StatsSection />

         {/* Features Section */}
         <FeaturesSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
