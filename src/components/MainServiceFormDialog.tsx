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
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import type { MainService } from "./MainServicesManager";

// Define the form schema using Zod
const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, { message: "Judul harus memiliki setidaknya 3 karakter." }),
  description: z.string().optional(),
  icon_name: z.string().min(2, { message: "Nama ikon diperlukan." }),
});

// Define the type for the form values
type FormValues = z.infer<typeof formSchema>;

interface MainServiceFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  service: MainService | null;
  onSave: (values: FormValues) => void; // Updated prop signature
}

export const MainServiceFormDialog = ({ isOpen, setIsOpen, service, onSave }: MainServiceFormDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      icon_name: "",
    },
  });

  // Populate form with service data when editing
  useEffect(() => {
    if (service && isOpen) {
      form.reset({
        id: service.id,
        title: service.title || "",
        description: service.description || "",
        icon_name: service.icon_name || "",
      });
    } else if (!isOpen) {
      form.reset(form.formState.defaultValues);
    }
  }, [service, isOpen, form]);

  // The submit handler now only calls the onSave prop.
  // The mutation logic is handled by the parent component.
  const onSubmit = (values: FormValues) => {
    onSave(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{service?.id ? "Edit Layanan Utama" : "Tambah Layanan Utama Baru"}</DialogTitle>
          <DialogDescription>
            Isi detail layanan di bawah ini. Perubahan akan ditampilkan di halaman /services.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Layanan</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Distribusi Musik" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Ikon (dari Lucide)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Upload, Shield, DollarSign" {...field} />
                  </FormControl>
                   <p className="text-xs text-muted-foreground pt-1">Cari nama ikon di situs <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-primary underline">lucide.dev</a>.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi singkat tentang layanan ini."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};