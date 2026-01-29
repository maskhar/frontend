import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// Asumsi tipe Plan sama dengan yang di halaman Pricing, perlu slug.
interface Plan {
  id: string;
  name: string;
  slug: string;
  price: string;
  period: string;
  description: string;
  long_description: any; // Tipe JSONB bisa berupa apa saja
  features: string[];
}

const PricingDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          throw new Error(`Paket dengan slug "${slug}" tidak ditemukan.`);
        }

        setPlan(data as Plan);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
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
              <Skeleton className="h-64 w-full" />
            </div>
          ) : error ? (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-destructive">Error</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : plan ? (
            <div>
              <h1 className="text-4xl font-bold text-center mb-4">{plan.name}</h1>
              <p className="text-xl text-center text-muted-foreground mb-10">{plan.description}</p>
              <div className="prose dark:prose-invert max-w-none">
                {/* Konten deskripsi panjang akan dirender di sini */}
                <h2>Detail Paket:</h2>
                <pre>{JSON.stringify(plan.long_description, null, 2)}</pre>
                <h2>Fitur Termasuk:</h2>
                <ul>
                  {plan.features?.map((feature, i) => <li key={i}>{feature}</li>)}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingDetailPage;
