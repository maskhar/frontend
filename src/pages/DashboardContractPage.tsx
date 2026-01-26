import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

import CategoryManager, { type Category } from '@/components/CategoryManager';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import PlanFormDialog, { type Plan } from '@/components/PlanFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

const DashboardContractPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      navigate('/login');
      return;
    }
    setUser(userData.user);

    const { data: categoriesData, error: catError } = await supabase.from('categories').select('*').order('display_order');
    const { data: plansData, error: planError } = await supabase.from('plans').select('*, categories(id, name)').order('display_order');

    if (catError || planError) {
      toast.error('Gagal memuat data: ' + (catError?.message || planError?.message));
    } else {
      setCategories(categoriesData as Category[]);
      setPlans(plansData as any[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleAddNewPlan = () => {
    setSelectedPlan(null);
    setIsFormOpen(true);
  };

  const handleDuplicatePlan = async (planToDuplicate: Plan) => {
    if (!planToDuplicate?.id) return;

    const newPlanData: Partial<Plan> = {
      ...planToDuplicate,
      id: undefined, // Penting: Hapus ID agar menjadi entri baru
      name: `${planToDuplicate.name} (Copy)`,
      display_order: plans.length + 1, // Letakkan di akhir untuk saat ini
      // Status akan default ke 'active' jika tidak didefinisikan di sini
    };

    // Panggil onSavePlan yang akan menangani insert karena tidak ada ID
    await onSavePlan(newPlanData as Plan);
    toast.success(`Paket "${newPlanData.name}" berhasil diduplikasi.`);
  };

  const handleDeletePlan = (plan: Plan) => {
    setPlanToDelete(plan);
    setIsAlertOpen(true);
  };

  const onSavePlan = async (plan: Plan) => {
    const { id, ...planData } = plan;

    // LANGKAH PENGAMAN: Hapus properti 'categories' secara eksplisit sebelum menyimpan.
    // Ini adalah benteng pertahanan terakhir untuk mencegah error.
    delete (planData as any).categories;

    // Pastikan fitur dalam format array yang benar sebelum disimpan
    const featuresToSave = typeof planData.features === 'string'
      ? planData.features.split('\n').filter(f => f.trim() !== '')
      : planData.features;

    const query = id
      ? supabase.from('plans').update({ ...planData, features: featuresToSave }).eq('id', id)
      : supabase.from('plans').insert({ ...planData, features: featuresToSave });

    const { error } = await query;
    if (error) {
      toast.error(`Gagal menyimpan: ${error.message}`);
    } else {
      toast.success(`Paket "${planData.name}" berhasil disimpan.`);
      setIsFormOpen(false);
      fetchData(); // Muat ulang semua data
    }
  };
  
  const onConfirmDelete = async () => {
    if (!planToDelete?.id) return;
    const { error } = await supabase.from('plans').delete().eq('id', planToDelete.id);
    if (error) {
      toast.error(`Gagal menghapus: ${error.message}`);
    } else {
      toast.success(`Paket "${planToDelete.name}" berhasil dihapus.`);
    }
    setIsAlertOpen(false);
    fetchData();
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return (
    <DashboardLayout user={user}>
      <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Manajemen Halaman Kontrak</h2>
          <Button onClick={handleAddNewPlan}>Tambah Paket Baru</Button>
      </div>

      <CategoryManager onCategoriesUpdate={fetchData} />
      
      {/* Container untuk layout kolom-kolom Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {categories.map((category) => (
          <div key={category.id} className="flex flex-col gap-4">
            {/* Header Kolom */}
            <div className="bg-muted/50 rounded-lg p-3">
              <h3 className="font-bold text-lg">{category.name}</h3>
            </div>

            {/* Konten Kolom (Kartu-kartu Paket) */}
            <div className="flex flex-col gap-4">
              {plans
                .filter((plan) => plan.category_id === category.id)
                .map((plan) => (
                  <Card key={plan.id} className="w-full">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span>{plan.name}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicatePlan(plan)}>
                              Duplikasi
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeletePlan(plan)}
                              className="text-destructive focus:text-destructive"
                            >
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardTitle>
                      <CardDescription>
                         {plan.price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(plan.price) : 'Gratis'}
                         {' / '}
                         {plan.billing_cycle === 'one_time' ? 'Sekali Bayar' : 'per Bulan'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {(Array.isArray(plan.features)
                            ? plan.features
                            : typeof plan.features === 'string'
                            ? plan.features.split('\n').filter(f => f.trim() !== '')
                            : []
                          ).map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                    </CardContent>
                  </Card>
                ))}
              {plans.filter((p) => p.category_id === category.id).length === 0 && (
                <p className="text-sm text-muted-foreground p-4 text-center">
                  Belum ada paket di kategori ini.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <PlanFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedPlan(null);
        }}
        onSave={onSavePlan}
        onDuplicate={handleDuplicatePlan}
        plan={selectedPlan}
        categories={categories}
      />
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus paket <span className="font-bold">"{planToDelete?.name}"</span> secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default DashboardContractPage;