import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Impor yang hilang
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import type { ServiceItem } from "./ServiceItemManager"; // Akan kita buat setelah ini

// Skema Zod untuk form
const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, { message: "Judul harus memiliki setidaknya 3 karakter." }),
  price_text: z.string().min(1, { message: "Teks harga/label tidak boleh kosong." }),
  description: z.string().optional(), // Tambahkan deskripsi
  image_url: z.string().optional(),
  image_file: z.instanceof(File).optional(),
  type: z.enum(['visual_grid', 'extra_service']),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceItemFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  item: ServiceItem | null;
  onSave: (values: Partial<ServiceItem>) => void;
}

export const ServiceItemFormDialog = ({ isOpen, setIsOpen, item, onSave }: ServiceItemFormDialogProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      price_text: "",
      description: "",
      image_url: "",
      type: 'visual_grid', // Default type
    },
  });

  // Handler untuk menghapus gambar
  const handleDeleteImage = () => {
    setImagePreview(null);
    form.setValue('image_file', undefined, { shouldValidate: true });
  };

  useEffect(() => {
    if (isOpen) {
      // Jika ada item, kita dalam mode 'edit', isi form dengan datanya
      if (item) {
        form.reset({
          id: item.id,
          title: item.title || "",
          price_text: item.price_text || "",
          description: item.description || "",
          image_url: item.image_url || "",
          type: item.type || 'visual_grid',
        });
        setImagePreview(item.image_url || null);
      } 
      // Jika tidak ada item, kita dalam mode 'tambah baru', pastikan form benar-benar kosong
      else {
        form.reset({
          id: undefined,
          title: "",
          price_text: "",
          description: "",
          image_url: "",
          type: 'visual_grid',
        });
        setImagePreview(null);
      }
    }
  }, [item, isOpen, form]);

  const onSubmit = async (values: FormValues) => {
    let finalImageUrl: string | null = item?.image_url || null;

    if (values.image_file) {
      const file = values.image_file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `service-items/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('services-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast.error("Gagal mengunggah gambar: " + uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('services-images')
        .getPublicUrl(uploadData.path);
      
      finalImageUrl = publicUrlData.publicUrl;
    } 
    else if (!values.image_file && !imagePreview) {
      finalImageUrl = null;
    }

    onSave({
      id: values.id,
      title: values.title,
      price_text: values.price_text,
      description: values.description,
      image_url: finalImageUrl,
      type: values.type,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Service Item" : "Tambah Service Item Baru"}</DialogTitle>
          <DialogDescription>
            Item ini akan muncul di grid "Service Terbaik" pada halaman /services.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Service</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Video Lirik Animasi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="price_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teks Harga / Label</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Mulai dari Rp 250.000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Detail</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi detail untuk ditampilkan di dialog..."
                      className="resize-vertical"
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="image_file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gambar Service</FormLabel>
                   {imagePreview && (
                    <div className="mt-2 flex items-end gap-2">
                      <img src={imagePreview} alt="Pratinjau" className="w-32 h-32 object-cover rounded-md border" />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDeleteImage}
                        className="text-destructive hover:text-destructive/80"
                      >
                        Hapus Gambar
                      </Button>
                    </div>
                  )}
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/png, image/jpeg, image/svg+xml, image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                        if (file) {
                          setImagePreview(URL.createObjectURL(file));
                        } else {
                          setImagePreview(item?.image_url || null);
                        }
                      }} 
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground pt-1">Pilih gambar baru untuk mengganti yang sudah ada.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

