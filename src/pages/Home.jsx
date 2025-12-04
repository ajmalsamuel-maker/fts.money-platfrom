import React from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import PartnersCarousel from '@/components/landing/PartnersCarousel';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import ProductsSection from '@/components/landing/ProductsSection';
import StatsSection from '@/components/landing/StatsSection';
import IntegrationSection from '@/components/landing/IntegrationSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <HeroSection />
            <PartnersCarousel />
            <FeaturesGrid />
            <ProductsSection />
            <StatsSection />
            <IntegrationSection />
            <CTASection />
            <Footer />
        </div>
    );
}