/**
 * ActionMenu Component
 * 
 * Purpose: Standardized dropdown menu for table row actions
 * 
 * Comment: Eliminates duplicate DropdownMenu boilerplate across all pages.
 * Provides consistent action menu styling and behavior.
 */

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ReactNode, memo } from "react";

interface ActionMenuProps {
  children: ReactNode; // EditModal, DeleteModal, or custom actions
  align?: "start" | "end" | "center"; // Menu alignment
}

/**
 * Comment: Simple wrapper that provides consistent action menu structure.
 * Children should be modal components (EditModal, DeleteModal, etc.)
 */
export const ActionMenu = memo(({ children, align = "end" }: ActionMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Comment: Icon-only button with consistent sizing */}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="p-2 w-auto min-w-[120px]">
        {/* Comment: Vertical flexbox allows modal buttons to stack */}
        <div className="flex flex-col gap-2 w-full">{children}</div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
