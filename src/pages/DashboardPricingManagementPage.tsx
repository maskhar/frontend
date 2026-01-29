import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Interfaces ---
interface Plan {
  id: string;
  name: string;
  slug: string | null;
  price: string | null;
  period: string | null;
  description: string | null;
  long_description: any;
  features: any;
  display_order: number;
  status: 'active' | 'inactive';
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string | null;
  long_description: string | null;
  status: 'active' | 'inactive';
  display_order: number;
}

interface User {
  id: string;
  email: string;
}

// --- Sub-components for CRUD ---

// Category CRUD Component
const CategoryManager = ({ categories, onDelete, openEditDialog }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Daftar Kategori Layanan</CardTitle>
      <CardDescription>Kelompok layanan utama yang Anda tawarkan.</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Slug</TableHead><TableHead>Urutan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
        <TableBody>
          {categories.map((cat: Category) => (
            <TableRow key={cat.id}>
              <TableCell className="font-medium">{cat.name}</TableCell>
              <TableCell className="text-muted-foreground text-xs">{cat.slug}</TableCell>
              <TableCell>{cat.display_order}</TableCell>
              <TableCell><Badge variant={cat.status === 'active' ? 'secondary' : 'outline'}>{cat.status}</Badge></TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent><DropdownMenuItem onClick={() => openEditDialog(cat)}>Edit</DropdownMenuItem><DropdownMenuItem onClick={() => onDelete(cat.id)}>Hapus</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// Plan CRUD Component
const PlanManager = ({ plans, categories, onDelete, openEditDialog }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Daftar Paket Harga</CardTitle>
      <CardDescription>Paket spesifik yang ada di dalam setiap kategori.</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Kategori</TableHead><TableHead>Harga</TableHead><TableHead>Urutan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
        <TableBody>
          {plans.map((plan: Plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">{plan.name}</TableCell>
              <TableCell>{categories.find((c: Category) => c.id === plan.category_id)?.name || '-'}</TableCell>
              <TableCell>{plan.price || '-'}</TableCell>
              <TableCell>{plan.display_order}</TableCell>
              <TableCell><Badge variant={plan.status === 'active' ? 'secondary' : 'outline'}>{plan.status}</Badge></TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent><DropdownMenuItem onClick={() => openEditDialog(plan)}>Edit</DropdownMenuItem><DropdownMenuItem onClick={() => onDelete(plan.id)}>Hapus</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// --- Main Page Component ---
const DashboardPricingManagementPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'category' | 'plan'>('category');
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Plan> | Partial<Category> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: plansData, error: plansError } = await supabase.from('plans').select('*').order('display_order');
      const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('*').order('display_order');
      if (plansError) throw plansError;
      if (categoriesError) throw categoriesError;
      setPlans(plansData as Plan[]);
      setCategories(categoriesData as Category[]);
    } catch (error: any) {
      toast.error("Gagal memuat data: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser({ id: session.user.id, email: session.user.email! });
    };
    getSession();
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!currentItem?.name) {
      toast.error("Nama tidak boleh kosong.");
      return;
    }

    const table = dialogType === 'category' ? 'categories' : 'plans';
    const itemToSave: any = { ...currentItem };
    
    if ('slug' in itemToSave && !itemToSave.slug) {
        itemToSave.slug = itemToSave.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '';
    }
    // Ensure JSON is not stringified before sending to DB
    if (dialogType === 'plan' && typeof itemToSave.long_description === 'string') {
      try {
        itemToSave.long_description = JSON.parse(itemToSave.long_description);
      } catch (e) {
        toast.error("Format JSON di Deskripsi Panjang tidak valid.");
        return;
      }
    }

    try {
      if (isEditMode) {
        const { error } = await supabase.from(table).update(itemToSave).eq('id', itemToSave.id!);
        if (error) throw error;
        toast.success(`Item berhasil diperbarui.`);
      } else {
        const { error } = await supabase.from(table).insert(itemToSave);
        if (error) throw error;
        toast.success(`Item berhasil ditambahkan.`);
      }
      setIsDialogOpen(false);
      setCurrentItem(null);
      fetchData();
    } catch (error: any) {
      toast.error("Gagal menyimpan: " + error.message);
    }
  };

  const handleDelete = async (id: string, type: 'category' | 'plan') => {
    const table = type === 'category' ? 'categories' : 'plans';
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      toast.success("Item berhasil dihapus.");
      fetchData();
    } catch (error: any) {
      toast.error("Gagal menghapus: " + error.message);
    }
  };
  
  const openDialog = (type: 'category' | 'plan', mode: 'add' | 'edit', item?: any) => {
    setDialogType(type);
    setIsEditMode(mode === 'edit');
    setCurrentItem(mode === 'add' ? { name: '', status: 'active', display_order: (type === 'category' ? categories.length : plans.length) + 1 } : { ...item });
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout user={user}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Harga & Paket</h1>
          <p className="text-muted-foreground">Kelola kategori layanan dan paket harga yang ditawarkan.</p>
        </div>
        <Button onClick={() => openDialog(document.querySelector<HTMLElement>('[data-state="active"]')?.dataset.value as any || 'category', 'add')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Baru
        </Button>
      </div>
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">Manajemen Kategori</TabsTrigger>
            <TabsTrigger value="plans">Manajemen Paket</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          {loading ? <p>Loading...</p> : <CategoryManager categories={categories} onDelete={(id: string) => handleDelete(id, 'category')} openEditDialog={(item: Category) => openDialog('category', 'edit', item)} />}
        </TabsContent>
        <TabsContent value="plans">
          {loading ? <p>Loading...</p> : <PlanManager plans={plans} categories={categories} onDelete={(id: string) => handleDelete(id, 'plan')} openEditDialog={(item: Plan) => openDialog('plan', 'edit', item)} />}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit' : 'Tambah'} {dialogType === 'category' ? 'Kategori' : 'Paket'}</DialogTitle>
          </DialogHeader>
          {currentItem && <div className="grid gap-4 py-4">
            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
                <div><Label>Nama</Label><Input value={currentItem.name || ''} onChange={(e) => setCurrentItem(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Slug</Label><Input value={(currentItem as any).slug || ''} onChange={(e) => setCurrentItem(p => ({ ...p, slug: e.target.value }))} placeholder="otomatis jika kosong" /></div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div><Label>Urutan Tampil</Label><Input type="number" value={(currentItem as any).display_order || 0} onChange={(e) => setCurrentItem(p => ({ ...p, display_order: parseInt(e.target.value) }))} /></div>
                <div><Label>Status</Label><Select value={(currentItem as any).status || 'active'} onValueChange={(v) => setCurrentItem(p => ({ ...p, status: v as any }))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
            </div>
            
            {dialogType === 'plan' && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Harga</Label><Input value={(currentItem as Plan).price || ''} onChange={(e) => setCurrentItem(p => ({ ...p, price: e.target.value }))} placeholder="Rp 50.000"/></div>
                        <div><Label>Periode</Label><Input value={(currentItem as Plan).period || ''} onChange={(e) => setCurrentItem(p => ({ ...p, period: e.target.value }))} placeholder="/ bulan"/></div>
                    </div>
                    <div><Label>Deskripsi Singkat (untuk kartu)</Label><Textarea value={(currentItem as Plan).description || ''} onChange={(e) => setCurrentItem(p => ({ ...p, description: e.target.value }))} /></div>
                    <div><Label>Deskripsi Panjang (JSON)</Label><Textarea value={(currentItem as Plan).long_description ? JSON.stringify((currentItem as Plan).long_description, null, 2) : ''} onChange={(e) => setCurrentItem(p => ({ ...p, long_description: e.target.value }))} rows={6} placeholder='{
  "title": "Judul Deskripsi",
  "content": "Isi paragraf di sini..."
}'/></div>
                    <div><Label>Kategori</Label><Select value={(currentItem as Plan).category_id || ''} onValueChange={(v) => setCurrentItem(p => ({ ...p, category_id: v }))}><SelectTrigger><SelectValue placeholder="Pilih kategori..."/></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                </>
            )}

            {dialogType === 'category' && (
                <>
                    <Label>Deskripsi Panjang (Detail Kategori)</Label>
                    <Textarea value={(currentItem as Category).long_description || ''} onChange={(e) => setCurrentItem(p => ({ ...p, long_description: e.target.value }))} rows={6}/>
                </>
            )}
          </div>}
          <DialogFooter>
            <DialogClose asChild><Button variant="secondary">Batal</Button></DialogClose>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DashboardPricingManagementPage;