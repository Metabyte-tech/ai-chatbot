"use client";

import { type ReactNode, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { cn } from "@/lib/utils";
import {
  CheckCircleFillIcon,
  ChevronDownIcon,
  GlobeIcon,
  LockIcon,
} from "./icons";

import { IngestionUI } from "./ingestion-ui";

export type VisibilityType = "private" | "public";

const visibilities: Array<{
  id: VisibilityType;
  label: string;
  description: string;
  icon: ReactNode;
}> = [
    {
      id: "private",
      label: "Private",
      description: "Only you can access this chat",
      icon: <LockIcon />,
    },
    {
      id: "public",
      label: "Public",
      description: "Anyone with the link can access this chat",
      icon: <GlobeIcon />,
    },
  ];

export function VisibilitySelector({
  chatId,
  className,
  selectedVisibilityType,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);

  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId,
    initialVisibilityType: selectedVisibilityType,
  });

  const selectedVisibility = useMemo(
    () => visibilities.find((visibility) => visibility.id === visibilityType),
    [visibilityType]
  );

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
      >
        <Button
          className="hidden h-8 md:flex md:h-fit md:px-2"
          data-testid="visibility-selector"
          variant="outline"
        >
          {selectedVisibility?.icon}
          <span className="md:sr-only">{selectedVisibility?.label}</span>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[340px] p-2">
        <div className="flex flex-col gap-1.5">
          {visibilities.map((visibility) => {
            const isActive = visibility.id === visibilityType;
            const gradientClass =
              visibility.id === "private"
                ? isActive
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30"
                  : "border border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
                : isActive
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30"
                  : "border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10";

            return (
              <DropdownMenuItem
                className={cn(
                  "group/item flex flex-row items-center justify-between gap-4 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200",
                  gradientClass
                )}
                data-active={isActive}
                data-testid={`visibility-selector-item-${visibility.id}`}
                key={visibility.id}
                onSelect={() => {
                  setVisibilityType(visibility.id);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-sm",
                      isActive
                        ? "bg-white/20"
                        : visibility.id === "private"
                          ? "bg-purple-500/15"
                          : "bg-cyan-500/15"
                    )}
                  >
                    {visibility.icon}
                  </span>
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-sm font-semibold leading-none">
                      {visibility.label}
                    </span>
                    {visibility.description && (
                      <span
                        className={cn(
                          "text-xs leading-none",
                          isActive ? "text-white/75" : "text-muted-foreground"
                        )}
                      >
                        {visibility.description}
                      </span>
                    )}
                  </div>
                </div>
                {isActive && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-white">
                    <CheckCircleFillIcon />
                  </span>
                )}
              </DropdownMenuItem>
            );
          })}
        </div>

        <IngestionUI />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
