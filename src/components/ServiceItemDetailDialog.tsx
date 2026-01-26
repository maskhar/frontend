import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { ServiceItem } from "./ServiceItemManager";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ServiceItemDetailDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  item: ServiceItem | null;
}

export const ServiceItemDetailDialog = ({ isOpen, setIsOpen, item }: ServiceItemDetailDialogProps) => {
  if (!item) return null; // Jangan render jika tidak ada item yang dipilih

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {/* Header Gambar */}
        <div className="relative w-full h-64 bg-gray-200">
          <img src={item.image_url || '/placeholder.svg'} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <DialogTitle className="absolute bottom-4 left-4 text-white text-3xl font-bold font-display z-10">{item.title}</DialogTitle>
        </div>

        <div className="p-6 space-y-4">
          {/* Informasi Dasar */}
          <div>
            <p className="text-lg font-semibold text-primary mb-2">{item.price_text}</p>
            <DialogDescription className="text-base text-muted-foreground">
              {item.description || "Tidak ada deskripsi detail yang tersedia."}
            </DialogDescription>
          </div>

          {/* TODO: Tambahkan lebih banyak bagian di sini, misalnya:
            - Daftar fitur (jika ada kolom di database)
            - Galeri gambar tambahan
            - Tombol "Pesan Sekarang" atau "Hubungi Kami"
          */}

          <div className="flex justify-end pt-4">
            <Button asChild>
              <Link to="/contract" onClick={() => setIsOpen(false)}>Pesan Layanan Ini</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
