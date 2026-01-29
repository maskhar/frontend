import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Menggunakan tipe data yang sama dari Pricing.tsx
interface Plan {
  id: string;
  name: string;
  price: string | null;
  period: string | null;
  description: string | null;
  features: any;
  popular: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  long_description: string | null;
  plans: Plan[];
}

const PricingCard = ({ plan, index }: { plan: Plan, index: number }) => (
  <motion.div
    key={plan.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className={`relative bg-card border rounded-2xl p-8 flex flex-col ${
      plan.popular ? 'border-primary shadow-lg shadow-primary/20' : 'border-border/50'
    }`}
  >
    {plan.popular && (
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
    <Button variant={plan.popular ? "hero" : "outline"} className="w-full gap-2 mt-auto">
      Pilih Paket
      <ArrowRight className="w-4 h-4" />
    </Button>
  </motion.div>
);

const CategoryDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('categories')
          .select(`
            *,
            plans (*)
          `)
          .eq('slug', slug)
          .eq('status', 'active')
          .single();

        if (error) {
          throw new Error(`Kategori dengan slug "${slug}" tidak ditemukan.`);
        }

        setCategory(data as Category);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [slug]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-6">
          {loading ? (
            <div>
              <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
              <Skeleton className="h-6 w-1/2 mx-auto mb-10" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-destructive">Error</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : category ? (
            <>
              <h1 className="text-4xl font-bold text-center mb-4">{category.name}</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                {category.plans.map((plan, index) => (
                  <PricingCard key={plan.id} plan={plan} index={index} />
                ))}
              </div>
              <div className="prose dark:prose-invert max-w-4xl mx-auto">
                <h2>Deskripsi Layanan</h2>
                <p>{category.long_description || 'Deskripsi lengkap belum tersedia.'}</p>
              </div>
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryDetailPage;
