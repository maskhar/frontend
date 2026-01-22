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

// Re-importing main types
import type { Plan } from './PlanFormDialog'; // We will create this component next
import type { Category } from './CategoryManager';


type PlanWithCategory = Plan & {
    categories: Category | null;
}

// Draggable Item Component
const SortablePlanItem = ({ plan, onEdit, onDelete }: { plan: PlanWithCategory, onEdit: (plan: Plan) => void, onDelete: (plan: Plan) => void }) => {    
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: plan.id! });

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
      className="flex items-center p-2 rounded-md bg-card border"
    >
      <div {...attributes} {...listeners} className="p-2 cursor-grab touch-none">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-grow">
        <p className="font-semibold">{plan.name}</p>
        <p className="text-sm text-muted-foreground">{plan.price}{plan.period || ''}</p>
      </div>
      <div>
        <Button variant="ghost" size="icon" onClick={() => onEdit(plan)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => onDelete(plan)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};


const PlanManager = ({ categories, plans, loading, onPlanUpdate, onEditPlan, onDeletePlan }: { categories: Category[], plans: PlanWithCategory[], loading: boolean, onPlanUpdate: () => void, onEditPlan: (plan: Plan) => void, onDeletePlan: (plan: Plan) => void }) => {
  const [groupedPlans, setGroupedPlans] = useState<Map<string, PlanWithCategory[]>>(new Map());

  // Group plans by category whenever the source data changes
  useEffect(() => {
    const newGrouped = new Map<string, PlanWithCategory[]>();
    categories.forEach(cat => {
      const categoryPlans = plans
        .filter(p => p.category_id === cat.id)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      newGrouped.set(cat.id!, categoryPlans);
    });
    setGroupedPlans(newGrouped);
  }, [plans, categories]);
  

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require mouse to move 8px before drag starts
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
        let newGroupedPlans = new Map(groupedPlans);
        
        for (const [categoryId, planList] of newGroupedPlans.entries()) {
            const oldIndex = planList.findIndex(p => p.id === active.id);
            const newIndex = planList.findIndex(p => p.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const reorderedList = arrayMove(planList, oldIndex, newIndex);
                newGroupedPlans.set(categoryId, reorderedList);

                setGroupedPlans(newGroupedPlans);

                // **THE FIX IS HERE**
                // We map over the reordered list and create a clean update payload.
                // This includes all original plan data, preventing null constraint errors.
                const updates = reorderedList.map((plan, index) => {
                  const { categories, ...restOfPlan } = plan; // Remove joined 'categories' object
                  return {
                    ...restOfPlan, // Spread the rest of the original plan data
                    display_order: index + 1, // Set the new order
                  };
                });

                const { error } = await supabase.from('plans').upsert(updates);

                if (error) {
                    toast.error('Gagal menyimpan urutan baru: ' + error.message);
                    onPlanUpdate(); // Refetch to revert to the correct state from DB
                } else {
                    toast.success('Urutan berhasil disimpan!');
                }
                break;
            }
        }
    }
  };


  if (loading) return <p>Memuat paket layanan...</p>;

  return (
    <div>
        <h3 className="text-xl font-semibold mb-4">Urutan Paket Layanan (Seret untuk Mengurutkan)</h3>
        <div className="space-y-8">
            {categories.map(category => (
                <div key={category.id}>
                    <h4 className="text-lg font-bold mb-3 p-2 bg-card rounded-md">{category.name}</h4>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={groupedPlans.get(category.id!)?.map(p => p.id!) || []}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {groupedPlans.get(category.id!)?.map(plan => (
                                    <SortablePlanItem 
                                        key={plan.id} 
                                        plan={plan}
                                        onEdit={() => onEditPlan(plan)}
                                        onDelete={() => onDeletePlan(plan)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                     {(!groupedPlans.get(category.id!) || groupedPlans.get(category.id!)?.length === 0) && (
                        <p className="text-sm text-muted-foreground p-2">Belum ada paket di kategori ini.</p>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};
export default PlanManager;