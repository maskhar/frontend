import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LayoutGrid, FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast, Toaster } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Reusable navigation content for both sidebar and mobile sheet
const DashboardNavContent = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const [isEditPageOpen, setIsEditPageOpen] = useState(false);

  return (
    <nav className="flex-grow px-4 py-4">
      <ul>
        <li>
          <NavLink
            to="/dashboard"
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-primary/10 text-primary'
              )
            }
            end // 'end' prop is important for the root dashboard link
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li className="mt-2">
          <Collapsible open={isEditPageOpen} onOpenChange={setIsEditPageOpen}>
            <CollapsibleTrigger
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isEditPageOpen && 'bg-primary/10 text-primary'
              )}
            >
              <FileText className="h-4 w-4" />
              <span>Edit Page</span>
              <ChevronDown className={cn('ml-auto h-4 w-4 transition-transform', isEditPageOpen && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden transition-all duration-300 ease-in-out">
              <ul className="ml-6 mt-1 space-y-1">
                <li>
                  <NavLink
                    to="/dashboard/contract"
                    onClick={onLinkClick}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        isActive && 'bg-primary/10 text-primary'
                      )
                    }
                  >
                    <span>Contract</span>
                  </NavLink>
                </li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </li>
      </ul>
    </nav>
  );
};

const DashboardLayout = ({ children, user }: { children: React.ReactNode, user: any }) => {
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal keluar: " + error.message);
    } else {
      toast.success("Berhasil keluar!");
      navigate('/login');
    }
  };
  
  const closeSheet = () => setIsSheetOpen(false);

  return (
    <div className="min-h-screen w-full">
       <Toaster richColors />
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:fixed md:inset-y-0 md:z-50 md:flex md:w-64 md:flex-col border-r bg-card">
        <div className="p-6">
            <h2 className="text-2xl font-bold font-display text-gradient">Soundpub</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
        <DashboardNavContent />
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex flex-col md:pl-64">
        {/* --- Mobile/Desktop Header --- */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background px-6 md:justify-end">
          
          {/* Mobile Menu Button */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Buka menu navigasi</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold font-display text-gradient">Soundpub</h2>
                    <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
                <DashboardNavContent onLinkClick={closeSheet} />
            </SheetContent>
          </Sheet>

          {/* User Info & Logout Button */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email || '...'}</span>
            <Button variant="outline" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;