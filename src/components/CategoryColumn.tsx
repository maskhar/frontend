import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { useMemo } from 'react';
import type { Category } from './CategoryManager';
import type { Plan } from './PlanFormDialog';
import { PlanCard } from './PlanCard';

export const CategoryColumn = ({
  category,
  plans,
  onEditPlan,
  onDeletePlan,
  onDuplicatePlan,
  onStatusChange, // 1. Menerima prop baru
}: {
  category: Category;
  plans: Plan[];
  onEditPlan: (plan: Plan) => void;
  onDeletePlan: (plan: Plan) => void;
    onDuplicatePlan: (plan: Plan) => void;
    onStatusChange: (plan: Plan, newStatus: 'active' | 'inactive') => void;
  }) => {
    // Filter out plans that don't have an ID to prevent dnd-kit from crashing.
    const validPlans = useMemo(() => plans.filter(p => p.id), [plans]);
    const plansIds = useMemo(() => validPlans.map(p => p.id!), [validPlans]);
  
    const { setNodeRef } = useSortable({
      id: category.id,
      data: {
        type: 'Category',
        category,
      },
    });
  
    return (
      <div ref={setNodeRef} className="flex flex-col gap-4">
        {/* Header Kolom */}
        <div className="bg-muted/50 rounded-lg p-3">
          <h3 className="font-bold text-lg">{category.name}</h3>
        </div>
  
        {/* Konten Kolom (Kartu-kartu Paket) */}
        <div className="flex flex-col gap-4">
          <SortableContext items={plansIds}>
            {validPlans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEditPlan={onEditPlan}
                onDeletePlan={onDeletePlan}
                onDuplicatePlan={onDuplicatePlan}
                onStatusChange={onStatusChange}
              />
            ))}
          </SortableContext>
          {validPlans.length === 0 && (
            <p className="text-sm text-muted-foreground p-4 text-center">
              Seret paket ke sini.
            </p>
          )}
        </div>
      </div>
    );
  };