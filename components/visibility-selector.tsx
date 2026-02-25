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

      <DropdownMenuContent
        align="start"
        className="min-w-[320px] rounded-2xl border border-white/10 bg-[#111318]/95 p-3 shadow-2xl backdrop-blur-xl"
      >
        {/* Section label */}
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Chat Visibility
        </p>

        <div className="flex flex-col gap-2">
          {visibilities.map((visibility) => {
            const isActive = visibility.id === visibilityType;
            const isPrivate = visibility.id === "private";

            return (
              <DropdownMenuItem
                key={visibility.id}
                data-active={isActive}
                data-testid={`visibility-selector-item-${visibility.id}`}
                onSelect={() => {
                  setVisibilityType(visibility.id);
                  setOpen(false);
                }}
                className={cn(
                  "group/item relative flex cursor-pointer select-none flex-row items-center justify-between gap-3 rounded-xl px-3 py-3 outline-none transition-all duration-200 focus:outline-none",
                  isActive
                    ? isPrivate
                      ? [
                        "bg-violet-500/15",
                        "ring-1 ring-violet-400/40",
                        "shadow-[0_0_18px_-4px_rgba(139,92,246,0.45)]",
                      ]
                      : [
                        "bg-sky-500/15",
                        "ring-1 ring-sky-400/40",
                        "shadow-[0_0_18px_-4px_rgba(56,189,248,0.45)]",
                      ]
                    : isPrivate
                      ? "hover:bg-violet-500/8 ring-1 ring-white/5 hover:ring-violet-400/20"
                      : "hover:bg-sky-500/8 ring-1 ring-white/5 hover:ring-sky-400/20"
                )}
              >
                {/* Left: icon + text */}
                <div className="flex items-center gap-3">
                  {/* Icon bubble */}
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl text-base transition-all duration-200",
                      isActive
                        ? isPrivate
                          ? "bg-violet-500/30 text-violet-200"
                          : "bg-sky-500/30 text-sky-200"
                        : isPrivate
                          ? "bg-white/5 text-violet-400"
                          : "bg-white/5 text-sky-400"
                    )}
                  >
                    {visibility.icon}
                  </span>

                  <div className="flex flex-col gap-0.5">
                    <span
                      className={cn(
                        "text-sm font-semibold leading-none tracking-tight",
                        isActive
                          ? isPrivate
                            ? "text-violet-100"
                            : "text-sky-100"
                          : "text-white/80"
                      )}
                    >
                      {visibility.label}
                    </span>
                    {visibility.description && (
                      <span className="text-[11px] leading-none text-white/35">
                        {visibility.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: active badge */}
                {isActive ? (
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                      isPrivate
                        ? "bg-violet-400/30 text-violet-200"
                        : "bg-sky-400/30 text-sky-200"
                    )}
                  >
                    <CheckCircleFillIcon />
                  </span>
                ) : (
                  <span className="h-5 w-5 rounded-full border border-white/10" />
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
