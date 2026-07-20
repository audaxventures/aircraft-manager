"use client";

import * as React from "react";
import { Check, Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface MultiComboboxProps {
  options: ComboboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  onCreate?: (label: string) => void | Promise<void>;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

function MultiCombobox({
  options,
  value,
  onChange,
  onCreate,
  placeholder = "Add…",
  searchPlaceholder = "Search or add a name…",
  className,
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedOptions = value.map((v) => options.find((o) => o.value === v)).filter((o): o is ComboboxOption => !!o);

  const exactMatch = options.some((o) => o.label.toLowerCase() === search.trim().toLowerCase());

  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }

  function remove(optionValue: string) {
    onChange(value.filter((v) => v !== optionValue));
  }

  return (
    <div className={cn("space-y-2", className)}>
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedOptions.map((o) => (
            <Badge key={o.value} variant="outline" className="gap-1 py-1 pr-1">
              {o.label}
              <button
                type="button"
                onClick={() => remove(o.value)}
                className="rounded-full p-0.5 hover:bg-secondary"
                aria-label={`Remove ${o.label}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-9 w-full items-center gap-2 rounded-md border border-dashed border-input px-3 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-secondary/50"
          >
            <Plus className="size-3.5" />
            {placeholder}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={true}>
            <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>
                {onCreate && search.trim() ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-secondary"
                    onClick={async () => {
                      await onCreate(search.trim());
                      setSearch("");
                    }}
                  >
                    <Plus className="size-4" /> Add &ldquo;{search.trim()}&rdquo;
                  </button>
                ) : (
                  "No matches."
                )}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggle(option.value)}
                  >
                    <Check className={cn("size-4", value.includes(option.value) ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </CommandItem>
                ))}
                {onCreate && search.trim() && !exactMatch && options.length > 0 && (
                  <CommandItem
                    value={`__create__${search}`}
                    onSelect={async () => {
                      await onCreate(search.trim());
                      setSearch("");
                    }}
                  >
                    <Plus className="size-4" /> Add &ldquo;{search.trim()}&rdquo;
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { MultiCombobox };
