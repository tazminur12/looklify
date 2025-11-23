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
    <div className="min-h-screen">
      {/* Hero Section - Image Background */}
      <section className="relative h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px] w-full">
        <ImageSlider />
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
