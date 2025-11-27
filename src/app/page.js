import ImageSlider from "./components/ImageSlider";
import FeaturesSection from "./components/FeaturesSection";
import FeaturedCategories from "./components/FeaturedCategories";
import FeaturedBrands from "./components/FeaturedBrands";
import FeaturedProducts from "./components/FeaturedProducts";
import FeaturedBlogs from "./components/FeaturedBlogs";
import StatsSection from "./components/StatsSection";
import PopularProductsOnOffer from "./components/PopularProductsOnOffer";

export default function Home() {

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section - Image Background */}
      <section className="relative w-full overflow-x-hidden">
        <div 
          className="relative w-full"
          style={{
            paddingBottom: '42%',
            minHeight: '180px',
            maxHeight: '340px'
          }}
        >
          <div className="absolute inset-0">
            <ImageSlider />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Featured Products */}
      <FeaturedProducts />
      
      {/* Popular Products on Offer */}
      <PopularProductsOnOffer />
      
      {/* Featured Blogs */}
      <FeaturedBlogs/>


    {/* Featured Brands */}
      <FeaturedBrands />

      

         {/* Features Section */}
         <FeaturesSection />

      {/* Stats Section */}
      <StatsSection />

     
    </div>
  );
}
