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
import type { HowItWorksStep } from "./HowItWorksManager";

// Define the form schema using Zod
const formSchema = z.object({
  id: z.string().optional(),
  step_number: z.string().min(1, { message: "Nomor langkah diperlukan." }),
  title: z.string().min(3, { message: "Judul harus memiliki setidaknya 3 karakter." }),
  description: z.string().optional(),
});

// Define the type for the form values
type FormValues = z.infer<typeof formSchema>;

interface HowItWorksFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  step: HowItWorksStep | null;
  onSave: (values: FormValues) => void; // Updated prop signature
}

export const HowItWorksFormDialog = ({ isOpen, setIsOpen, step, onSave }: HowItWorksFormDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      step_number: "",
      title: "",
      description: "",
    },
  });

  // Populate form with step data when editing
  useEffect(() => {
    if (step && isOpen) {
      form.reset({
        id: step.id,
        step_number: step.step_number || "",
        title: step.title || "",
        description: step.description || "",
      });
    } else if (!isOpen) {
      form.reset(form.formState.defaultValues);
    }
  }, [step, isOpen, form]);

  // The submit handler now only calls the onSave prop.
  const onSubmit = (values: FormValues) => {
    onSave(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{step?.id ? "Edit Langkah " : "Tambah Langkah Baru"}</DialogTitle>
          <DialogDescription>
            Isi detail langkah di bawah ini. Perubahan akan ditampilkan di halaman /services.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="step_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Langkah</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 01, 02" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Langkah</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Daftar, Upload" {...field} />
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
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi singkat tentang langkah ini."
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
