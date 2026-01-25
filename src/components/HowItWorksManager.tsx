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

// Type for a single how-it-works step
export interface HowItWorksStep {
  id: string;
  created_at?: string;
  step_number: string | null;
  title: string;
  description: string | null;
  display_order: number | null;
}

// Draggable Item Component
const SortableStepItem = ({ step, onEdit, onDelete }: { step: HowItWorksStep, onEdit: (step: HowItWorksStep) => void, onDelete: (step: HowItWorksStep) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id! });

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
        <p className="font-semibold">{`${step.step_number}. ${step.title}`}</p>
        <p className="text-sm text-muted-foreground line-clamp-1">{step.description}</p>
      </div>
      <div className="ml-4">
        <Button variant="ghost" size="icon" onClick={() => onEdit(step)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => onDelete(step)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};


const HowItWorksManager = ({ initialSteps, loading, onUpdate, onEdit, onDelete }: { initialSteps: HowItWorksStep[], loading: boolean, onUpdate: () => void, onEdit: (step: HowItWorksStep) => void, onDelete: (step: HowItWorksStep) => void }) => {
  const [steps, setSteps] = useState<HowItWorksStep[]>([]);

  useEffect(() => {
    // Sort initial steps by display_order
    const sorted = [...initialSteps].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    setSteps(sorted);
  }, [initialSteps]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
        const oldIndex = steps.findIndex(s => s.id === active.id);
        const newIndex = steps.findIndex(s => s.id === over.id);

        const reorderedList = arrayMove(steps, oldIndex, newIndex);
        setSteps(reorderedList);

        const updates = reorderedList.map((step, index) => ({
            ...step,
            display_order: index,
        }));

        const { error } = await supabase.from('how_it_works_steps').upsert(updates);

        if (error) {
            toast.error('Gagal menyimpan urutan baru: ' + error.message);
            onUpdate(); // Refetch to revert
        } else {
            toast.success('Urutan langkah berhasil disimpan!');
        }
    }
  };

  if (loading) return <p>Memuat langkah-langkah...</p>;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Kelola Langkah "Cara Kerja"</h3>
            <Button onClick={() => onEdit({} as HowItWorksStep)}>Tambah Langkah Baru</Button>
        </div>

        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={steps.map(s => s.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3">
                    {steps.map(step => (
                        <SortableStepItem 
                            key={step.id} 
                            step={step}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>

        {steps.length === 0 && (
            <p className="text-sm text-muted-foreground p-4 text-center border-dashed border-2 rounded-lg">Belum ada langkah. Klik "Tambah Langkah Baru" untuk memulai.</p>
        )}
    </div>
  );
};

export default HowItWorksManager;