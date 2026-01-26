import type { Category } from './CategoryManager';
import type { Plan } from './PlanFormDialog';
import { PlanCard } from './PlanCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CategoryColumnProps {
  category: Category;
  plans: Plan[];
  onEditPlan: (plan: Plan) => void;
  onDeletePlan: (plan: Plan) => void;
  onDuplicatePlan: (plan: Plan) => void;
  onPlanUpdate: () => void;
}

export function CategoryColumn({ category, plans, onEditPlan, onDeletePlan, onDuplicatePlan, onPlanUpdate }: CategoryColumnProps) {
  // Semua logika DND dihapus
  
  return (
    <Card className="w-full sm:w-[350px] flex-shrink-0 h-full flex flex-col">
      <CardHeader className="p-4 border-b">
        <CardTitle>{category.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col gap-2 p-2">
        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onEdit={onEditPlan}
            onDelete={onDeletePlan}
            onDuplicate={onDuplicatePlan}
            onPlanUpdate={onPlanUpdate}
          />
        ))}
        {plans.length === 0 && (
          <div className="text-center text-sm text-muted-foreground p-4">
            Tidak ada paket di kategori ini.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
