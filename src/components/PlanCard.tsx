import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Pencil, Copy, Trash2 } from 'lucide-react';
import type { Plan } from './PlanFormDialog';

export const PlanCard = ({
  plan,
  onEditPlan,
  onDeletePlan,
  onDuplicatePlan,
  onStatusChange, // Prop baru untuk handle perubahan status
}: {
  plan: Plan;
  onEditPlan: (plan: Plan) => void;
  onDeletePlan: (plan: Plan) => void;
  onDuplicatePlan: (plan: Plan) => void;
  onStatusChange: (plan: Plan, newStatus: 'active' | 'inactive') => void; // Definisi tipe untuk prop baru
}) => {
  // Defensive check: If plan or plan.id is missing, do not render the card.
  // This prevents a fatal error in the useSortable hook.
  if (!plan?.id) {
    return null;
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: plan.id, // Now we are sure plan.id exists
    data: {
      type: 'Plan',
      plan,
    },
  });

  // Style untuk animasi drag-and-drop
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // Tampilan kartu saat sedang di-drag
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-full bg-card p-4 rounded-lg border-2 border-primary opacity-50"
      >
        <p className="text-sm font-medium">{plan.name}</p>
      </div>
    );
  }

  // Tampilan kartu normal
  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-full touch-none flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-base">
          <span>{plan.name}</span>
        </CardTitle>
      </CardHeader>
      
      {/* Footer berisi semua tombol aksi */}
      <CardFooter className="p-3 border-t bg-muted/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
           <Switch
            id={`status-${plan.id}`}
            checked={plan.status === 'active'}
            onCheckedChange={(checked) => {
              onStatusChange(plan, checked ? 'active' : 'inactive');
            }}
          />
           <label htmlFor={`status-${plan.id}`} className="text-xs font-medium text-muted-foreground">
            {plan.status === 'active' ? 'Aktif' : 'Nonaktif'}
          </label>
        </div>
        
        <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditPlan(plan)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDuplicatePlan(plan)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/80" onClick={() => onDeletePlan(plan)}>
              <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
};