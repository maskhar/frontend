import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@supabase/supabase-js';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        // This check is secondary, ProtectedRoute in App.tsx is the primary guard
        navigate('/login');
      }
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return (
    <DashboardLayout user={user}>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <p>Selamat datang di panel admin. Silakan pilih menu dari sidebar untuk memulai.</p>
    </DashboardLayout>
  );
};

export default DashboardPage;