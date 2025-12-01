import { HeroSection } from "../components/home/HeroSection";
import { CategoriesSection } from "../components/home/CategoriesSection";
import { FeaturedProducts } from "../components/home/FeaturedProducts";
import { PromoBanner } from "../components/home/PromoBanner";
import { Footer } from "../components/layout/Footer";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="-mt-20 -mx-4 sm:-mx-6 lg:-mx-8">
      <HeroSection locale={locale} />
      <CategoriesSection locale={locale} />
      <FeaturedProducts locale={locale} />
      <PromoBanner locale={locale} />
      <Footer />
    </div>
  );
}
