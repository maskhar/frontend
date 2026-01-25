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

// Tipe untuk satu service item
export interface ServiceItem {
  id: string;
  created_at?: string;
  title: string;
  price_text: string;
  image_url: string;
  display_order: number | null;
  type: 'visual_grid' | 'extra_service';
}

// Komponen untuk item yang bisa di-drag
const SortableItem = ({ item, onEdit, onDelete }: { item: ServiceItem, onEdit: (item: ServiceItem) => void, onDelete: (item: ServiceItem) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center p-3 rounded-lg bg-card border shadow-sm">
      <div {...attributes} {...listeners} className="p-2 cursor-grab touch-none">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <img 
        src={item.image_url || '/placeholder.svg'} 
        alt={item.title}
        className="h-12 w-12 rounded-md object-cover mr-4 border"
      />
      <div className="flex-grow">
        <p className="font-semibold">{item.title}</p>
        <p className="text-sm text-muted-foreground">{item.price_text}</p>
      </div>
      <div className="ml-4">
        <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => onDelete(item)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const ServiceItemManager = ({ initialItems, loading, onUpdate, onEdit, onDelete }: { initialItems: ServiceItem[], loading: boolean, onUpdate: () => void, onEdit: (item: ServiceItem) => void, onDelete: (item: ServiceItem) => void }) => {
  const [items, setItems] = useState<ServiceItem[]>([]);

  useEffect(() => {
    const sorted = [...initialItems].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    setItems(sorted);
  }, [initialItems]);
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const reorderedList = arrayMove(items, oldIndex, newIndex);
        setItems(reorderedList);

        const updates = reorderedList.map((item, index) => ({ ...item, display_order: index }));
        const { error } = await supabase.from('service_items').upsert(updates);

        if (error) {
            toast.error('Gagal menyimpan urutan baru: ' + error.message);
            onUpdate(); // Revert by refetching
        } else {
            toast.success('Urutan item berhasil disimpan!');
        }
    }
  };

  if (loading) return <p>Memuat item...</p>;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Kelola Service Grid</h3>
            <Button onClick={() => onEdit({ type: 'visual_grid' } as ServiceItem)}>Tambah Item Baru</Button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                    {items.map(item => (
                        <SortableItem key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
        {items.length === 0 && (
            <p className="text-sm text-muted-foreground p-4 text-center border-dashed border-2 rounded-lg">Belum ada item. Klik "Tambah Item Baru" untuk memulai.</p>
        )}
    </div>
  );
};

export default ServiceItemManager;
