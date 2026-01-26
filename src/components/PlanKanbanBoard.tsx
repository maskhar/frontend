import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

import type { Category } from './CategoryManager';
import type { Plan } from './PlanFormDialog';
import { CategoryColumn } from './CategoryColumn';
import { PlanCard } from './PlanCard';

export const PlanKanbanBoard = ({
  categories,
  plans,
  onPlanUpdate,
  onEditPlan,
  onDeletePlan,
  onDuplicatePlan,
  onStatusChange,
}: {
  categories: Category[];
  plans: Plan[];
  onPlanUpdate: (
    planId: string,
    updates: { display_order?: number; category_id?: string }
  ) => Promise<void>;
  onEditPlan: (plan: Plan) => void;
  onDeletePlan: (plan: Plan) => void;
  onDuplicatePlan: (plan: Plan) => void;
  onStatusChange: (plan: Plan, newStatus: 'active' | 'inactive') => void;
}) => {
  const [internalPlans, setInternalPlans] = useState<Plan[]>([]);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);

  // Sync internal state with external props
  useEffect(() => {
    setInternalPlans(plans);
  }, [plans]);

  const validCategories = useMemo(() => categories.filter(cat => cat.id), [categories]);
  const categoriesId = useMemo(() => validCategories.map(cat => cat.id!), [validCategories]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Plan') {
      setActivePlan(event.active.data.current.plan);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActivePlan(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activePlan = active.data.current?.plan as Plan;
    const overPlan = over.data.current?.plan as Plan;
    const overCategory = over.data.current?.category as Category;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const isOverAColumn = over.data.current?.type === 'Category';
    
    // Find current and new container IDs
    const activeContainer = activePlan.category_id;
    let newContainer: string;
    if(isOverAColumn) {
      newContainer = overId;
    } else {
      newContainer = overPlan.category_id;
    }

    if (activeContainer !== newContainer) {
      // Move to a new column
      setInternalPlans(prev => {
        const activeIndex = prev.findIndex(p => p.id === activeId);
        prev[activeIndex].category_id = newContainer;
        return [...prev];
      });
      onPlanUpdate(activeId, { category_id: newContainer, display_order: 1 }); // Simplification: move to top
    } else {
      // Reorder within the same column
      const oldIndex = internalPlans.findIndex(p => p.id === activeId);
      const newIndex = internalPlans.findIndex(p => p.id === overId);
      
      const reordered = arrayMove(internalPlans, oldIndex, newIndex);
      setInternalPlans(reordered);

      // Create a batch update for the backend
      const plansInColumn = reordered.filter(p => p.category_id === activeContainer);
      plansInColumn.forEach((plan, index) => {
         onPlanUpdate(plan.id!, { display_order: index + 1 });
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        <SortableContext items={categoriesId}>
          {validCategories.map(cat => (
            <CategoryColumn
              key={cat.id}
              category={cat}
              plans={internalPlans.filter(p => p.category_id === cat.id)}
              onEditPlan={onEditPlan}
              onDeletePlan={onDeletePlan}
              onDuplicatePlan={onDuplicatePlan}
              onStatusChange={onStatusChange}
            />
          ))}
        </SortableContext>
      </div>

      {createPortal(
        <DragOverlay>
          {activePlan && (
            <PlanCard
              plan={activePlan}
              onEditPlan={() => {}}
              onDeletePlan={() => {}}
              onDuplicatePlan={() => {}}
              onStatusChange={() => {}}
            />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

