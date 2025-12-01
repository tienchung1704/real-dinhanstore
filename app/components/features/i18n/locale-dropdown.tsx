"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import { CheckCheck, Globe } from "lucide-react";

import { cn } from "@/lib/utils";

import { localeOptionsList } from "./config";

type LocaleSwitcherProps = Omit<
  React.ComponentProps<typeof Button>,
  "value" | "onValueChange"
>;

export function LocaleDropdown({ className, ...props }: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isPending} asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-9 w-9 cursor-pointer", className)}
          {...props}
        >
          <Globe className="h-[1.3rem] w-[1.3rem] hover:text-zinc-200" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="p-3 w-40 mt-2">
        {localeOptionsList.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => handleLocaleChange(lang.value)}
            className={currentLocale === lang.value ? "bg-muted" : ""}
          >
            {lang.label}
            {currentLocale === lang.value && (
              <CheckCheck className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
