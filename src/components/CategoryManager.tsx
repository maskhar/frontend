import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch'; // Tambahkan impor Switch
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { toast } from 'sonner';
import { Pencil, Trash2, PlusCircle, Copy } from 'lucide-react'; // Tambahkan impor Copy

export type Category = {
  id?: string;
  name: string;
  display_order?: number;
  status?: 'active' | 'inactive';
};

const CategoryManager = ({ onCategoriesUpdate }: { onCategoriesUpdate: () => void }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('display_order');
    if (error) {
      toast.error('Gagal memuat kategori: ' + error.message);
    } else {
      setCategories(data as Category[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddNew = () => {
    setSelectedCategory({ name: '', status: 'active' }); // Inisialisasi dengan status aktif
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete?.id) return;
    
    // Panggil fungsi RPC untuk menghapus kategori secara aman
    const { error } = await supabase.rpc('handle_category_delete', { category_id_to_delete: categoryToDelete.id });
    
    if (error) {
      toast.error(`Gagal menghapus kategori: ${error.message}`);
    } else {
      toast.success(`Kategori "${categoryToDelete.name}" berhasil dihapus. Paket-paket terkait telah dipindahkan.`);
      fetchCategories();
      onCategoriesUpdate(); // Notify parent component
    }
    setIsAlertOpen(false);
  };

  const handleSave = async () => {
    if (!selectedCategory) return;
    const { id, ...categoryData } = selectedCategory;

    const dataToSave = { // Pastikan status dikirim
        ...categoryData,
        status: categoryData.status || 'active', 
    };

    const query = id
      ? supabase.from('categories').update(dataToSave).eq('id', id)
      : supabase.from('categories').insert(dataToSave);

    const { error } = await query;

    if (error) {
      toast.error(`Gagal menyimpan: ${error.message}`);
    } else {
      toast.success(`Kategori "${categoryData.name}" berhasil disimpan.`);
      setIsDialogOpen(false);
      setSelectedCategory(null); // Reset selectedCategory setelah save/close
      fetchCategories();
      onCategoriesUpdate(); // Notify parent component
    }
  };

  const handleDuplicate = async (categoryToDuplicate: Category) => {
    // Buat objek kategori baru dengan status dan urutan yang sama, tambahkan "(Copy)" di nama
    const newCategoryData: Partial<Category> = {
      name: `${categoryToDuplicate.name} (Copy)`,
      display_order: categoryToDuplicate.display_order ? categoryToDuplicate.display_order + 0.1 : categories.length + 1, // Sedikit di belakang aslinya
      status: categoryToDuplicate.status,
    };

    // Masukkan kategori baru ke database
    const { data: newCategory, error: newCategoryError } = await supabase.from('categories').insert(newCategoryData).select().single();

    if (newCategoryError) {
      toast.error(`Gagal menduplikasi kategori: ${newCategoryError.message}`);
      return;
    }

    // Cari semua paket yang terkait dengan kategori asli
    const { data: plansToDuplicate, error: plansError } = await supabase
      .from('plans')
      .select('*')
      .eq('category_id', categoryToDuplicate.id!); 

    if (plansError) {
      toast.error(`Gagal mengambil paket untuk duplikasi: ${plansError.message}`);
      // Lanjutkan meskipun ada error paket, kategori sudah diduplikasi
    }

    if (plansToDuplicate && plansToDuplicate.length > 0) {
      // Duplikasi setiap paket dan tautkan ke kategori baru
      const newPlans = plansToDuplicate.map(plan => ({
        category_id: newCategory?.id, // Tautkan ke kategori baru
        name: `${plan.name} (Copy)`,
        price: plan.price,
        period: plan.period,
        description: plan.description,
        features: plan.features,
        popular: plan.popular,
        display_order: plan.display_order,
        status: plan.status,
      }));

      const { error: insertPlansError } = await supabase.from('plans').insert(newPlans);

      if (insertPlansError) {
        toast.error(`Gagal menduplikasi paket-paket terkait: ${insertPlansError.message}`);
      }
    }

    toast.success(`Kategori "${newCategoryData.name}" berhasil diduplikasi.`);
    fetchCategories();
    onCategoriesUpdate();
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Manajemen Kategori</h3>
        <Button onClick={handleAddNew} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>
      <div className="border rounded-lg p-4 space-y-2">
        {loading ? <p>Memuat kategori...</p> : 
          categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-2 rounded-md bg-card">
              <div className="flex items-center gap-3">
                <Switch
                  checked={cat.status === 'active'}
                  onCheckedChange={async (checked) => {
                    const newStatus = checked ? 'active' : 'inactive';
                    const { error } = await supabase.from('categories').update({ status: newStatus }).eq('id', cat.id!); // Pastikan id tidak null
                    if (error) {
                      toast.error(`Gagal mengubah status kategori: ${error.message}`);
                    } else {
                      toast.success(`Status kategori "${cat.name}" diubah menjadi ${newStatus}.`);
                      fetchCategories();
                      onCategoriesUpdate();
                    }
                  }}
                  id={`status-${cat.id}`}
                />
                <span className="font-medium">{cat.name}</span>
                {cat.status === 'inactive' && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">Nonaktif</span>
                )}
              </div>
              <div>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDuplicate(cat)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDelete(cat)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        }
      </div>

      {/* Dialog for Edit/Create Category */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSelectedCategory(null); // Reset selectedCategory saat dialog ditutup
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory?.id ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              id="name"
              placeholder="Nama Kategori"
              value={selectedCategory?.name || ''}
              onChange={(e) => selectedCategory && setSelectedCategory({ ...selectedCategory, name: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Alert for Delete Category */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus kategori <span className="font-bold">"{categoryToDelete?.name}"</span> dan memindahkan paket terkait ke kategori "Uncategorized".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryManager;
