import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import MainServicesManager, { type MainService } from '@/components/MainServicesManager';
import { MainServiceFormDialog } from '@/components/MainServiceFormDialog';
import HowItWorksManager, { type HowItWorksStep } from '@/components/HowItWorksManager';
import { HowItWorksFormDialog } from '@/components/HowItWorksFormDialog';
import ServiceItemManager, { type ServiceItem } from '@/components/ServiceItemManager'; // Import baru
import { ServiceItemFormDialog } from '@/components/ServiceItemFormDialog'; // Import baru


import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardServicesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [userLoading, setUserLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/login');
      setUser(user);
      setUserLoading(false);
    };
    fetchUser();
  }, [navigate]);

  // --- Fetch Main Services ---
  const { data: mainServices, isLoading: isLoadingMainServices, isError: isErrorMainServices } = useQuery<MainService[], Error>({
    queryKey: ['mainServices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('main_services').select('*').order('display_order');
      if (error) throw error;
      return data || [];
    },
    enabled: !userLoading
  });

  // --- Fetch How It Works Steps ---
  const { data: howItWorksSteps, isLoading: isLoadingHowItWorks, isError: isErrorHowItWorks } = useQuery<HowItWorksStep[], Error>({
    queryKey: ['howItWorksSteps'],
    queryFn: async () => {
      const { data, error } = await supabase.from('how_it_works_steps').select('*').order('display_order');
      if (error) throw error;
      return data || [];
    },
    enabled: !userLoading
  });
  
  // --- Fetch Service Items ---
  const { data: serviceItems, isLoading: isLoadingServiceItems, isError: isErrorServiceItems } = useQuery<ServiceItem[], Error>({
    queryKey: ['serviceItems'],
    queryFn: async () => {
      const { data, error } = await supabase.from('service_items').select('*').order('display_order');
      if (error) throw error;
      return data || [];
    },
    enabled: !userLoading
  });

  // --- State Declarations ---
  const [isMainServiceFormOpen, setIsMainServiceFormOpen] = useState(false);
  const [selectedMainService, setSelectedMainService] = useState<MainService | null>(null);
  const [mainServiceToDelete, setMainServiceToDelete] = useState<MainService | null>(null);
  const [isMainServiceAlertOpen, setIsMainServiceAlertOpen] = useState(false);

  const [isHowItWorksFormOpen, setIsHowItWorksFormOpen] = useState(false);
  const [selectedHowItWorksStep, setSelectedHowItWorksStep] = useState<HowItWorksStep | null>(null);
  const [howItWorksStepToDelete, setHowItWorksStepToDelete] = useState<HowItWorksStep | null>(null);
  const [isHowItWorksAlertOpen, setIsHowItWorksAlertOpen] = useState(false);
  
  const [isServiceItemFormOpen, setIsServiceItemFormOpen] = useState(false);
  const [selectedServiceItem, setSelectedServiceItem] = useState<ServiceItem | null>(null);
  const [serviceItemToDelete, setServiceItemToDelete] = useState<ServiceItem | null>(null);
  const [isServiceItemAlertOpen, setIsServiceItemAlertOpen] = useState(false);

  // --- Mutations ---
  const mainServiceMutation = useMutation({
    mutationFn: async (service: Partial<MainService>) => {
      const { error } = await supabase.from('main_services').upsert(service);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mainServices'] });
      toast.success("Layanan utama berhasil disimpan!");
      setIsMainServiceFormOpen(false);
    },
    onError: (error) => toast.error("Gagal menyimpan layanan utama: " + error.message),
  });

  const deleteMainServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase.from('main_services').delete().eq('id', serviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mainServices'] });
      toast.success(`Layanan "${mainServiceToDelete?.title}" berhasil dihapus.`);
      setIsMainServiceAlertOpen(false);
    },
    onError: (error) => toast.error("Gagal menghapus layanan utama: " + error.message),
  });

  const howItWorksStepMutation = useMutation({
    mutationFn: async (step: Partial<HowItWorksStep>) => {
      const { error } = await supabase.from('how_it_works_steps').upsert(step);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['howItWorksSteps'] });
      toast.success(`Langkah "Cara Kerja" berhasil disimpan!`);
      setIsHowItWorksFormOpen(false);
    },
    onError: (error) => toast.error(`Gagal menyimpan langkah "Cara Kerja": ${error.message}`),
  });

  const deleteHowItWorksStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      const { error } = await supabase.from('how_it_works_steps').delete().eq('id', stepId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['howItWorksSteps'] });
      toast.success(`Langkah "${howItWorksStepToDelete?.title}" berhasil dihapus.`);
      setIsHowItWorksAlertOpen(false);
    },
    onError: (error) => toast.error(`Gagal menghapus langkah "Cara Kerja": ${error.message}`),
  });
  
  const serviceItemMutation = useMutation({
    mutationFn: async (item: Partial<ServiceItem>) => {
      const { error } = await supabase.from('service_items').upsert(item);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceItems'] });
      toast.success("Service item berhasil disimpan!");
      setIsServiceItemFormOpen(false);
    },
    onError: (error) => toast.error("Gagal menyimpan service item: " + error.message),
  });

  const deleteServiceItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from('service_items').delete().eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceItems'] });
      toast.success(`Item "${serviceItemToDelete?.title}" berhasil dihapus.`);
      setIsServiceItemAlertOpen(false);
    },
    onError: (error) => toast.error("Gagal menghapus service item: " + error.message),
  });


  // --- Handlers ---
  const handleEditMainService = (service: MainService) => {
    setSelectedMainService(service);
    setIsMainServiceFormOpen(true);
  };
  const handleDeleteMainService = (service: MainService) => {
    setMainServiceToDelete(service);
    setIsMainServiceAlertOpen(true);
  };
  const onConfirmDeleteMainService = () => {
    if (mainServiceToDelete?.id) deleteMainServiceMutation.mutate(mainServiceToDelete.id);
  };
  const onSaveMainService = (values: Partial<MainService>) => mainServiceMutation.mutate(values);

  const handleEditHowItWorksStep = (step: HowItWorksStep) => {
    setSelectedHowItWorksStep(step);
    setIsHowItWorksFormOpen(true);
  };
  const handleDeleteHowItWorksStep = (step: HowItWorksStep) => {
    setHowItWorksStepToDelete(step);
    setIsHowItWorksAlertOpen(true);
  };
  const onConfirmDeleteHowItWorksStep = () => {
    if (howItWorksStepToDelete?.id) deleteHowItWorksStepMutation.mutate(howItWorksStepToDelete.id);
  };
  const onSaveHowItWorksStep = (values: Partial<HowItWorksStep>) => howItWorksStepMutation.mutate(values);

  const handleEditServiceItem = (item: ServiceItem) => {
    setSelectedServiceItem(item);
    setIsServiceItemFormOpen(true);
  };
  const handleDeleteServiceItem = (item: ServiceItem) => {
    setServiceItemToDelete(item);
    setIsServiceItemAlertOpen(true);
  };
  const onConfirmDeleteServiceItem = () => {
    if (serviceItemToDelete?.id) deleteServiceItemMutation.mutate(serviceItemToDelete.id);
  };
  const onSaveServiceItem = (values: Partial<ServiceItem>) => serviceItemMutation.mutate(values);

  // --- Loading/Error State ---
  const isOverallLoading = userLoading || isLoadingMainServices || isLoadingHowItWorks || isLoadingServiceItems;
  const isOverallError = isErrorMainServices || isErrorHowItWorks || isErrorServiceItems;

  if (isOverallLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }
  
  if (isOverallError) {
      return <div className="min-h-screen flex items-center justify-center text-destructive">Terjadi kesalahan saat memuat data.</div>;
  }

  return (
    <DashboardLayout user={user}>
        <h2 className="text-3xl font-bold mb-8">Manajemen Halaman Services</h2>
        
        <Tabs defaultValue="main-services" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="main-services">Layanan Utama</TabsTrigger>
                <TabsTrigger value="how-it-works">Cara Kerja</TabsTrigger>
                <TabsTrigger value="service-grid">Service Grid</TabsTrigger>
            </TabsList>
            <TabsContent value="main-services" className="mt-6">
                <div className="bg-card p-6 rounded-lg shadow-sm">
                    <MainServicesManager 
                        initialServices={mainServices || []}
                        loading={isLoadingMainServices}
                        onUpdate={() => queryClient.invalidateQueries({ queryKey: ['mainServices'] })}
                        onEdit={handleEditMainService}
                        onDelete={handleDeleteMainService}
                    />
                </div>
            </TabsContent>
            <TabsContent value="how-it-works" className="mt-6">
                <div className="bg-card p-6 rounded-lg shadow-sm">
                    <HowItWorksManager
                        initialSteps={howItWorksSteps || []}
                        loading={isLoadingHowItWorks}
                        onUpdate={() => queryClient.invalidateQueries({ queryKey: ['howItWorksSteps'] })}
                        onEdit={handleEditHowItWorksStep}
                        onDelete={handleDeleteHowItWorksStep}
                    />
                </div>
            </TabsContent>
            <TabsContent value="service-grid" className="mt-6">
                <div className="bg-card p-6 rounded-lg shadow-sm">
                    <ServiceItemManager
                        initialItems={serviceItems || []}
                        loading={isLoadingServiceItems}
                        onUpdate={() => queryClient.invalidateQueries({ queryKey: ['serviceItems'] })}
                        onEdit={handleEditServiceItem}
                        onDelete={handleDeleteServiceItem}
                    />
                </div>
            </TabsContent>
        </Tabs>

      {/* --- Dialogs & Alerts --- */}
      <MainServiceFormDialog isOpen={isMainServiceFormOpen} setIsOpen={setIsMainServiceFormOpen} service={selectedMainService} onSave={onSaveMainService} />
      <AlertDialog open={isMainServiceAlertOpen} onOpenChange={setIsMainServiceAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini akan menghapus layanan <span className="font-bold">"{mainServiceToDelete?.title}"</span> secara permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDeleteMainService} className="bg-destructive hover:bg-destructive/90" disabled={deleteMainServiceMutation.isPending}>{deleteMainServiceMutation.isPending ? "Menghapus..." : "Ya, Hapus"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <HowItWorksFormDialog isOpen={isHowItWorksFormOpen} setIsOpen={setIsHowItWorksFormOpen} step={selectedHowItWorksStep} onSave={onSaveHowItWorksStep} />
      <AlertDialog open={isHowItWorksAlertOpen} onOpenChange={setIsHowItWorksAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini akan menghapus langkah <span className="font-bold">"{howItWorksStepToDelete?.title}"</span> secara permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDeleteHowItWorksStep} className="bg-destructive hover:bg-destructive/90" disabled={deleteHowItWorksStepMutation.isPending}>{deleteHowItWorksStepMutation.isPending ? "Menghapus..." : "Ya, Hapus"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ServiceItemFormDialog isOpen={isServiceItemFormOpen} setIsOpen={setIsServiceItemFormOpen} item={selectedServiceItem} onSave={onSaveServiceItem} />
      <AlertDialog open={isServiceItemAlertOpen} onOpenChange={setIsServiceItemAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini akan menghapus item <span className="font-bold">"{serviceItemToDelete?.title}"</span> secara permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDeleteServiceItem} className="bg-destructive hover:bg-destructive/90" disabled={deleteServiceItemMutation.isPending}>{deleteServiceItemMutation.isPending ? "Menghapus..." : "Ya, Hapus"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default DashboardServicesPage;
