import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListMusic, History, Star } from 'lucide-react';

const DashboardMusicPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // @ts-ignore
      setUser(session?.user ?? null);
    };
    getSession();
  }, []);

  return (
    // @ts-ignore
    <DashboardLayout user={user}>
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Musik</CardTitle>
            <CardDescription>
              Kelola playlist, lihat riwayat dengar, dan temukan musik baru yang direkomendasikan untuk Anda.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Playlist Saya</CardTitle>
              <ListMusic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Fitur untuk membuat dan mengelola playlist akan tersedia di sini.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Riwayat Dengar</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Riwayat lagu yang telah Anda putar akan ditampilkan di sini.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rekomendasi</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Temukan musik baru yang dipersonalisasi untuk Anda di sini.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardMusicPage;