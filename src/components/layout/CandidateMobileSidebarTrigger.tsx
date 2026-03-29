'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CandidateSidebar } from '@/components/layout/CandidateSidebar';

interface CandidateMobileSidebarTriggerProps {
  role?: string;
}

export function CandidateMobileSidebarTrigger({ role }: CandidateMobileSidebarTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open sidebar"
          className="text-slate-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <CandidateSidebar role={role} />
      </SheetContent>
    </Sheet>
  );
}
