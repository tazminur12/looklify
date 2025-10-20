import ImageSlider from "./components/ImageSlider";
import FeaturesSection from "./components/FeaturesSection";
import FeaturedCategories from "./components/FeaturedCategories";
import StatsSection from "./components/StatsSection";
import CTASection from "./components/CTASection";

export default function Home() {

  return (
    <div className="min-h-screen">
      {/* Hero Section - Image Background */}
      <section className="relative h-[60vh] sm:h-[65vh] lg:h-[70vh] w-full">
        <ImageSlider />
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Stats Section */}
      <StatsSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
