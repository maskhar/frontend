import type { Plan } from './PlanFormDialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Pencil, Copy, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onDuplicate: (plan: Plan) => void;
  onPlanUpdate: () => void;
}

export function PlanCard({ plan, onEdit, onDelete, onDuplicate, onPlanUpdate }: PlanCardProps) {

  const handleStatusChange = async (checked: boolean) => {
    const newStatus = checked ? 'active' : 'inactive';
    const { error } = await supabase.from('plans').update({ status: newStatus }).eq('id', plan.id!);
    if (error) {
      toast.error(`Gagal mengubah status: ${error.message}`);
    } else {
      toast.success(`Status "${plan.name}" diubah.`);
      onPlanUpdate();
    }
  };

  return (
    <Card className="bg-background">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">{plan.name}</CardTitle>
        {/* GripVertical handle is removed */}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-sm text-muted-foreground mb-4">
          {plan.price}{plan.period || ''}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={plan.status === 'active'}
              onCheckedChange={handleStatusChange}
              aria-label={`Toggle status for ${plan.name}`}
            />
            {plan.status === 'inactive' && <Badge variant="outline">Nonaktif</Badge>}
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => onEdit(plan)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDuplicate(plan)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => onDelete(plan)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
