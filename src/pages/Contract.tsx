import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, CheckCircle, ArrowRight, ShieldCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import type { Plan } from "@/components/PlanFormDialog";
import type { Category } from "@/components/CategoryManager";

// Reusable Component for Card
const PricingCard = ({ plan, index }: { plan: Plan, index: number }) => (
  <motion.div
    key={plan.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className={`relative bg-card border rounded-2xl p-8 flex flex-col ${
      (plan as any).popular
        ? 'border-primary shadow-lg shadow-primary/20' 
        : 'border-border/50'
    }`}
  >
    {(plan as any).popular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
        Populer
      </div>
    )}
    
    <h3 className="text-xl font-bold font-display mb-2">{plan.name}</h3>
    <div className="mb-4">
      <span className="text-3xl font-bold text-gradient">{plan.price}</span>
      {plan.period && <span className="text-muted-foreground text-sm"> {plan.period}</span>}
    </div>
    <p className="text-muted-foreground text-sm mb-6 h-10">{plan.description}</p>
    
    <ul className="space-y-3 mb-8 flex-grow">
      {plan.features?.map((feature: string, i: number) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          {feature}
        </li>
      ))}
    </ul>

    <Button 
      variant={(plan as any).popular ? "hero" : "outline"} 
      className="w-full gap-2 mt-auto"
    >
      Pilih Paket
      <ArrowRight className="w-4 h-4" />
    </Button>
  </motion.div>
);

// Skeleton loader for pricing cards
const SectionSkeleton = () => (
    <section className="mb-24">
        <Skeleton className="h-8 w-1/2 mx-auto mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-2xl p-8 flex flex-col">
                <Skeleton className="h-6 w-1/2 mb-4" />
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-4 w-full mb-6" />
                <div className="space-y-3 mb-8 flex-grow">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-full" />
                </div>
                <Skeleton className="h-10 w-full mt-auto" />
            </div>
            ))}
        </div>
    </section>
);

// Helper to get an appropriate icon based on category name
const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('hak cipta')) return <ShieldCheck className="text-primary w-6 h-6" />;
    if (name.includes('label')) return <Building2 className="text-primary w-6 h-6" />;
    return <FileText className="text-primary w-6 h-6" />;
}

const Contract = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: categoriesData, error: catError } = await supabase.from('categories').select('*').order('display_order');
      const { data: plansData, error: planError } = await supabase.from('plans').select('*').order('display_order');

      if (catError || planError) {
        console.error("Error fetching data:", catError || planError);
        setError("Gagal memuat data. Silakan coba lagi nanti.");
      } else {
        setCategories(categoriesData as Category[]);
        setPlans(plansData as Plan[]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Main Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm mb-6">
              <FileText className="w-4 h-4" />
              Layanan Distribusi & Proteksi
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              <span className="text-gradient">Contract</span> & Pricing
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk merilis, melindungi, dan mengelola label musik Anda.
            </p>
          </motion.div>

          {error && <div className="text-center text-destructive">{error}</div>}
          
          {loading ? (
            <>
                <SectionSkeleton />
                <SectionSkeleton />
            </>
          ) : (
            categories.map(category => (
              <section key={category.id} className="mb-24">
                <div className="flex items-center gap-3 mb-10 justify-center text-center">
                    {getIconForCategory(category.name)}
                    <h2 className="text-2xl md:text-3xl font-bold font-display">{category.name}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {plans
                    .filter(plan => plan.category_id === category.id)
                    .map((plan, index) => (
                      <PricingCard key={plan.id} plan={plan} index={index} />
                    ))}
                </div>
              </section>
            ))
          )}

          {/* FAQ Note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center text-muted-foreground mt-20 p-8 border-t border-border/50"
          >
            <p className="text-lg">Punya kebutuhan khusus atau volume besar?</p>
            <a href="/kolaborasi" className="text-primary font-bold hover:underline flex items-center justify-center gap-2 mt-2">
              Hubungi Tim Sales Kami <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contract;