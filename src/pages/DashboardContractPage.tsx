import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

import CategoryManager, { type Category } from '@/components/CategoryManager';
import PlanManager from '@/components/PlanManager';
import PlanFormDialog, { type Plan } from '@/components/PlanFormDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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

  const handleDeletePlan = (plan: Plan) => {
    setPlanToDelete(plan);
    setIsAlertOpen(true);
  };

  const onSavePlan = async (plan: Plan) => {
    // Destructuring untuk mendapatkan 'id' dan sisa data plan
    const { id, ...planData } = plan;

    // Ambil properti 'categories' yang merupakan hasil join dari sisa data.
    // 'planDataForUpdate' sekarang adalah objek bersih yang hanya berisi kolom asli dari tabel 'plans'.
    const { categories, ...planDataForUpdate } = planData as any;

    // Pastikan fitur dalam format array yang benar sebelum disimpan
    const featuresToSave = typeof planDataForUpdate.features === 'string'
      ? planDataForUpdate.features.split('\n').filter(f => f.trim() !== '')
      : planDataForUpdate.features;

    // Tentukan query: UPDATE jika ada ID, INSERT jika tidak ada
    const query = id
      ? supabase.from('plans').update({ ...planDataForUpdate, features: featuresToSave }).eq('id', id)
      // Pastikan display_order default diatur untuk item baru jika diperlukan
      : supabase.from('plans').insert({ ...planDataForUpdate, features: featuresToSave, display_order: plans.length + 1 });

    const { error } = await query;
    if (error) {
      toast.error(`Gagal menyimpan: ${error.message}`);
    } else {
      toast.success(`Paket "${planData.name}" berhasil disimpan.`);
      setIsFormOpen(false);
      fetchData(); // Muat ulang semua data untuk sinkronisasi
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
      
      <PlanManager 
        categories={categories}
        plans={plans as any[]}
        loading={loading}
        onPlanUpdate={fetchData}
        onEditPlan={handleEditPlan}
        onDeletePlan={handleDeletePlan}
      />

      <PlanFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={onSavePlan}
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