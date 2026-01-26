import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Category } from './CategoryManager';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';

export type Plan = {
  id?: string;
  category_id: string;
  name: string;
  price: string | null;
  period: string | null;
  description: string | null;
  features: string[] | null | string; // Allow string for editing state
  popular: boolean;
  display_order?: number;
  status?: 'active' | 'inactive'; // Tambahkan kolom status
};

const EMPTY_PLAN: Plan = {
  category_id: '',
  name: '',
  price: '',
  period: '',
  description: '',
  features: '',
  popular: false,
  status: 'active', // Default ke aktif
};

const PlanFormDialog = ({
  isOpen,
  onClose,
  onSave,
  plan,
  categories,
  onDuplicate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Plan) => void;
  plan: Plan | null;
  categories: Category[];
  onDuplicate?: (plan: Plan) => void; // Tambahkan prop onDuplicate
}) => {
  const [formData, setFormData] = useState<Plan>(EMPTY_PLAN);

  useEffect(() => {
    if (plan) {
      setFormData(plan);
    } else {
      // Jika membuat paket baru, default ke kategori pertama dan status aktif
      const defaultData = { ...EMPTY_PLAN, category_id: categories[0]?.id || '' };
      setFormData(defaultData);
    }
  }, [plan, categories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveClick = () => {
    onSave(formData);
  };

  const handleDuplicateClick = () => {
    if (onDuplicate && plan) {
      onDuplicate(plan);
    }
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{plan?.id ? 'Edit Paket' : 'Tambah Paket Baru'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category_id" className="text-right">
              Kategori
            </Label>
            {/* Simple select for now, can be replaced with shadcn Select if needed */}
            <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({...prev, category_id: e.target.value}))}
                className="col-span-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-input border p-2"
            >
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nama</Label>
            <Input id="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Harga</Label>
            <Input id="price" value={formData.price || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="period" className="text-right">Periode</Label>
            <Input id="period" value={formData.period || ''} onChange={handleInputChange} className="col-span-3" placeholder="Contoh: /lagu atau /tahun" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Deskripsi</Label>
            <Textarea id="description" value={formData.description || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="features" className="text-right">Fitur</Label>
            <Textarea
              id="features"
              value={
                formData.features
                  ? Array.isArray(formData.features)
                    ? formData.features.join('\n')
                    : formData.features
                  : ''
              }
              onChange={handleInputChange}
              className="col-span-3"
              rows={8}
              placeholder="Satu fitur per baris..."
            />
          </div>
          {plan?.id && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status Aktif</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Switch
                  id="status"
                  checked={formData.status === 'active'}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
                />
                <span>{formData.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          {plan?.id && onDuplicate && (
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleDuplicateClick}
            >
              Duplikat
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" onClick={handleSaveClick}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanFormDialog;
