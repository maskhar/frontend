import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Upload, Send, DollarSign, Shield, Headphones, BarChart3, FileCheck, Users, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

import type { ServiceItem } from "@/components/ServiceItemManager"; // Import tipe ServiceItem
import { ServiceItemDetailDialog } from "@/components/ServiceItemDetailDialog"; // Import dialog baru

// --- Type Definitions ---
interface MainService {
  id: string;
  title: string;
  description: string;
  icon_name: string;
}

interface HowItWorksStep {
  id: string;
  step_number: string;
  title: string;
  description: string;
}

// --- Icon Mapping ---
// Maps icon names from the database to actual Lucide components
const iconMap: { [key: string]: React.ElementType } = {
  Upload,
  Shield,
  DollarSign,
  BarChart3,
  FileCheck,
  Headphones,
  Users,
  Send,
};

// New Component for the visual service grid (moved from Contract.tsx)
const ServiceGrid = ({ items, onItemSelected }: { items: ServiceItem[], onItemSelected: (item: ServiceItem) => void }) => (
  <section className="my-40 bg-background/50 py-16 px-6 rounded-3xl border border-border/50 shadow-lg">

    <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-5">
      Kami Memberikan <span className="text-gradient">Service</span>Terbaik
    </h2>

    <p className="text-center text-muted-foreground max-w-2xxl mx-auto mb-20">
      Reputasi kami terbentuk dari kolaborasi dengan para artis serta rekaman-rekaman berkualitas yang dihasilkan di studio kami.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative rounded-2xl overflow-hidden group aspect-w-1 aspect-h-1 cursor-pointer"
          onClick={() => onItemSelected(item)} // Tambahkan handler klik
        >
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h3 className="text-white text-2xl font-bold font-display mb-2">{item.title}</h3>
            <span className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full">{item.price_text}</span>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

const Services = () => {
  // --- State Management ---
  const [mainServices, setMainServices] = useState<MainService[]>([]);
  const [howItWorksSteps, setHowItWorksSteps] = useState<HowItWorksStep[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk dialog detail service item
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<ServiceItem | null>(null);

  // Handler saat item Service Grid diklik
  const handleServiceItemSelected = (item: ServiceItem) => {
    setSelectedDetailItem(item);
    setIsDetailDialogOpen(true);
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [servicesRes, stepsRes, serviceItemsRes] = await Promise.all([
        supabase.from('main_services').select('*').order('display_order'),
        supabase.from('how_it_works_steps').select('*').order('display_order'),
        supabase.from('service_items').select('*').order('display_order')
      ]);

      if (servicesRes.error || stepsRes.error || serviceItemsRes.error) {
        console.error("Error fetching services page data:", servicesRes.error || stepsRes.error || serviceItemsRes.error);
        setError("Gagal memuat layanan. Silakan coba lagi nanti.");
      } else {
        setMainServices(servicesRes.data || []);
        setHowItWorksSteps(stepsRes.data || []);
        setServiceItems(serviceItemsRes.data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const visualGridItems = serviceItems.filter(item => item.type === 'visual_grid');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              <span className="text-gradient">Layanan</span> Kami
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Solusi lengkap untuk distribusi dan pengelolaan musik digital Anda.
            </p>
          </motion.div>

          {error && <div className="text-center text-destructive mb-10">{error}</div>}

          {/* Services Grid (Main Services) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-card border border-border/50 rounded-2xl p-6">
                  <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mt-1" />
                </div>
              ))
            ) : (
              mainServices.map((service, index) => {
                const Icon = iconMap[service.icon_name] || HelpCircle; // Fallback icon
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm">{service.description}</p>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold font-display text-center mb-12">
              Cara <span className="text-gradient">Menjual Musik</span> Anda
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="text-center"
                  >
                    <Skeleton className="h-12 w-16 mx-auto mb-4" />
                    <Skeleton className="h-6 w-24 mx-auto mb-2" />
                    <Skeleton className="h-4 w-40 mx-auto" />
                  </div>
                ))
              ) : (
                howItWorksSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-5xl font-bold text-gradient font-display mb-4">
                      {step.step_number}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Button variant="hero" size="lg" asChild>
              <Link to="/contract">Mulai Sekarang</Link>
            </Button>
          </motion.div>

          {/* --- Visual Service Grid (from services-template.png) --- */}
          {!loading && visualGridItems.length > 0 && <ServiceGrid items={visualGridItems} onItemSelected={handleServiceItemSelected} />}

        </div>
      </main>

      <Footer />

      {/* Dialog Detail Service Item */}
      <ServiceItemDetailDialog 
        isOpen={isDetailDialogOpen}
        setIsOpen={setIsDetailDialogOpen}
        item={selectedDetailItem}
      />
    </div>
  );
};

export default Services;



