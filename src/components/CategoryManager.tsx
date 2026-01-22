import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Pencil, Trash2, PlusCircle } from 'lucide-react';

export type Category = {
  id?: string;
  name: string;
  display_order?: number;
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
    setSelectedCategory({ name: '' });
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
    const { error } = await supabase.from('categories').delete().eq('id', categoryToDelete.id);
    if (error) {
      toast.error(`Gagal menghapus: ${error.message}`);
    } else {
      toast.success(`Kategori "${categoryToDelete.name}" berhasil dihapus.`);
      fetchCategories();
      onCategoriesUpdate(); // Notify parent component
    }
    setIsAlertOpen(false);
  };

  const handleSave = async () => {
    if (!selectedCategory) return;
    const { id, ...categoryData } = selectedCategory;

    const query = id
      ? supabase.from('categories').update(categoryData).eq('id', id)
      : supabase.from('categories').insert(categoryData);

    const { error } = await query;

    if (error) {
      toast.error(`Gagal menyimpan: ${error.message}`);
    } else {
      toast.success(`Kategori "${categoryData.name}" berhasil disimpan.`);
      setIsDialogOpen(false);
      fetchCategories();
      onCategoriesUpdate(); // Notify parent component
    }
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
              <span className="font-medium">{cat.name}</span>
              <div>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                  <Pencil className="h-4 w-4" />
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              Tindakan ini akan menghapus kategori <span className="font-bold">"{categoryToDelete?.name}"</span> dan SEMUA paket layanan di dalamnya secara permanen.
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
