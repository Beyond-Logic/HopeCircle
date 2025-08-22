"use client";

import * as React from "react";
import { countries } from "countries-list";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";

type CountrySelectProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

type CountryOption = {
  code: string;
  value: string; // country name
  label: string; // country name
  emoji: string; // flag emoji
};

// Fallback if a code doesn’t have an emoji (rare)
const codeToFlag = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select country…",
  disabled,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);

  console.log("Selected country:", countries);

  // Build options from countries-list once
  const options = React.useMemo<CountryOption[]>(
    () =>
      Object.entries(countries).map(([code, c]) => ({
        code,
        value: c.name,
        label: c.name,
        emoji: codeToFlag(code),
      })),
    []
  );

  const selected = React.useMemo(
    () => options.find((o) => o.value === value) || null,
    [options, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between mt-2"
        >
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              <span className="text-lg">{selected.emoji}</span>
              <span className="truncate">{selected.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country…" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={`${opt.label} ${opt.code} ${opt.emoji}`}
                  onSelect={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span className="mr-2 text-lg">{opt.emoji}</span>
                  <span className="flex-1 truncate">{opt.label}</span>
                  <Check
                    className={`ml-2 h-4 w-4 ${
                      value === opt.value ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
