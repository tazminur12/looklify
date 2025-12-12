import ImageSlider from "./components/ImageSlider";
import FeaturesSection from "./components/FeaturesSection";
import FeaturedCategories from "./components/FeaturedCategories";
import FeaturedBrands from "./components/FeaturedBrands";
import FeaturedProducts from "./components/FeaturedProducts";
import FeaturedBlogs from "./components/FeaturedBlogs";
import StatsSection from "./components/StatsSection";
import PopularProductsOnOffer from "./components/PopularProductsOnOffer";
import ImageSlider2 from "./components/ImageSlider2";

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section - Primary Image Slider */}
      <ImageSlider />

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Secondary Slider */}
      <ImageSlider2 />

      {/* Popular Products on Offer */}
      <PopularProductsOnOffer />

      {/* Featured Blogs */}
      <FeaturedBlogs />

      {/* Featured Brands */}
      <FeaturedBrands />

      {/* Features Section */}
      <FeaturesSection />

      {/* Stats Section */}
      <StatsSection />
    </div>
  );
}
