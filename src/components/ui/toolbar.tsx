"use client";

import { Toolbar as ToolbarPrimitive } from "react-aria-components";

import { Separator } from "#/components/ui/separator.tsx";
import { cn } from "#/lib/utils.ts";

function Toolbar({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive>) {
  return (
    <ToolbarPrimitive
      data-slot="toolbar"
      className={cn("flex flex-row flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

function ToolbarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator orientation="vertical" className={cn("h-6", className)} {...props} />;
}

export { Toolbar, ToolbarSeparator };
