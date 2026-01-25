import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Type for a single service item
export interface MainService {
  id: string;
  created_at?: string;
  title: string;
  description: string | null;
  icon_name: string | null;
  display_order: number | null;
}

// Draggable Item Component
const SortableServiceItem = ({ service, onEdit, onDelete }: { service: MainService, onEdit: (service: MainService) => void, onDelete: (service: MainService) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-3 rounded-lg bg-card border shadow-sm"
    >
      <div {...attributes} {...listeners} className="p-2 cursor-grab touch-none">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-grow ml-2">
        <p className="font-semibold">{service.title}</p>
        <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>
      </div>
      <div className="ml-4">
        <Button variant="ghost" size="icon" onClick={() => onEdit(service)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => onDelete(service)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};


const MainServicesManager = ({ initialServices, loading, onUpdate, onEdit, onDelete }: { initialServices: MainService[], loading: boolean, onUpdate: () => void, onEdit: (service: MainService) => void, onDelete: (service: MainService) => void }) => {
  const [services, setServices] = useState<MainService[]>([]);

  useEffect(() => {
    // Sort initial services by display_order
    const sorted = [...initialServices].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    setServices(sorted);
  }, [initialServices]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
        const oldIndex = services.findIndex(s => s.id === active.id);
        const newIndex = services.findIndex(s => s.id === over.id);

        const reorderedList = arrayMove(services, oldIndex, newIndex);
        setServices(reorderedList);

        const updates = reorderedList.map((service, index) => ({
            ...service,
            display_order: index,
        }));

        const { error } = await supabase.from('main_services').upsert(updates);

        if (error) {
            toast.error('Gagal menyimpan urutan baru: ' + error.message);
            onUpdate(); // Refetch to revert
        } else {
            toast.success('Urutan layanan utama berhasil disimpan!');
        }
    }
  };

  if (loading) return <p>Memuat layanan utama...</p>;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Kelola Layanan Utama</h3>
            <Button onClick={() => onEdit({} as MainService)}>Tambah Layanan Baru</Button>
        </div>

        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={services.map(s => s.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3">
                    {services.map(service => (
                        <SortableServiceItem 
                            key={service.id} 
                            service={service}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>

        {services.length === 0 && (
            <p className="text-sm text-muted-foreground p-4 text-center border-dashed border-2 rounded-lg">Belum ada layanan utama. Klik "Tambah Layanan Baru" untuk memulai.</p>
        )}
    </div>
  );
};

export default MainServicesManager;