import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

import CategoryManager, { type Category } from '@/components/CategoryManager';
import { PlanKanbanBoard } from '@/components/PlanKanbanBoard';
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
    // ... (fetchData logic remains the same)
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      navigate('/login');
      return;
    }
    setUser(userData.user);

    const { data: categoriesData, error: catError } = await supabase.from('categories').select('*').order('display_order');
    const { data: plansData, error: planError } = await supabase.from('plans').select('*').order('display_order');

    if (catError || planError) {
      toast.error('Gagal memuat data: ' + (catError?.message || planError?.message));
    } else {
      const uncategorized = categoriesData.find(c => c.name.toLowerCase() === 'uncategorized');
      const otherCategories = categoriesData.filter(c => c.name.toLowerCase() !== 'uncategorized');
      const sortedCategories = [...otherCategories];
      if (uncategorized) {
        sortedCategories.push(uncategorized);
      }
      setCategories(sortedCategories as Category[]);
      setPlans(plansData as any[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handlePlanUpdate = async (planId: string, updates: { display_order?: number; category_id?: string }) => {
    // ... (handlePlanUpdate logic remains the same)
    const { error } = await supabase.from('plans').update(updates).eq('id', planId);
    if (error) {
      toast.error(`Gagal memperbarui paket: ${error.message}`);
      fetchData();
    }
  };

  const handleStatusChange = async (plan: Plan, newStatus: 'active' | 'inactive') => {
    // ... (handleStatusChange logic remains the same)
    const { error } = await supabase.from('plans').update({ status: newStatus }).eq('id', plan.id!);
    if (error) {
      toast.error(`Gagal mengubah status: ${error.message}`);
      fetchData();
    } else {
      toast.success(`Status "${plan.name}" berhasil diubah.`);
    }
  };

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
      id: undefined,
      name: `${planToDuplicate.name} (Copy)`,
      display_order: plans.length + 1,
    };
    await onSavePlan(newPlanData as Plan);
    toast.success(`Paket "${newPlanData.name}" berhasil diduplikasi.`);
  };

  const handleDeletePlan = (plan: Plan) => {
    setPlanToDelete(plan);
    setIsAlertOpen(true);
  };

  const onSavePlan = async (plan: Plan) => {
    const { id, ...planData } = plan;
    delete (planData as any).categories;
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
      fetchData();
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
      
      <PlanKanbanBoard
        categories={categories}
        plans={plans}
        onPlanUpdate={handlePlanUpdate}
        onEditPlan={handleEditPlan}
        onDeletePlan={handleDeletePlan}
        onDuplicatePlan={handleDuplicatePlan}
        onStatusChange={handleStatusChange}
      />

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