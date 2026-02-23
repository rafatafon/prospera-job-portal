"use client";

import React, { useCallback, useState, forwardRef } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, CheckIcon } from "lucide-react";
import { CircleFlag } from "react-circle-flags";
import {
  type Country,
  filteredCountries,
  findCountryByAlpha3,
  getCountryName,
} from "@/lib/countries";

export type { Country } from "@/lib/countries";

type CountryDropdownProps = {
  locale: string;
  onChange?: (country: Country) => void;
  defaultValue?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

const CountryDropdownComponent = (
  {
    locale,
    onChange,
    defaultValue,
    disabled = false,
    placeholder,
    className,
  }: CountryDropdownProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    () => (defaultValue ? findCountryByAlpha3(defaultValue) : null)
  );

  const handleSelect = useCallback(
    (country: Country) => {
      setSelectedCountry(country);
      onChange?.(country);
      setOpen(false);
    },
    [onChange]
  );

  const defaultPlaceholder =
    locale === "es" ? "Seleccionar pais" : "Select a country";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 hover:bg-slate-50",
          className
        )}
        disabled={disabled}
      >
        {selectedCountry ? (
          <div className="flex items-center flex-grow gap-2 overflow-hidden">
            <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
              <CircleFlag
                countryCode={selectedCountry.alpha2.toLowerCase()}
                height={20}
              />
            </div>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {getCountryName(selectedCountry.alpha2, locale)}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">
            {placeholder ?? defaultPlaceholder}
          </span>
        )}
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        collisionPadding={10}
        side="bottom"
        className="min-w-[--radix-popper-anchor-width] p-0"
      >
        <Command
          className="w-full max-h-[200px] sm:max-h-[270px]"
          filter={(value, search) => {
            const country = filteredCountries.find(
              (c) => c.alpha2.toLowerCase() === value
            );
            if (!country) return 0;
            const localizedName = getCountryName(
              country.alpha2,
              locale
            ).toLowerCase();
            const englishName = country.name.toLowerCase();
            const term = search.toLowerCase();
            if (
              localizedName.includes(term) ||
              englishName.includes(term) ||
              country.alpha2.toLowerCase().includes(term)
            )
              return 1;
            return 0;
          }}
        >
          <CommandList>
            <div className="sticky top-0 z-10 bg-popover">
              <CommandInput
                placeholder={
                  locale === "es" ? "Buscar pais..." : "Search country..."
                }
              />
            </div>
            <CommandEmpty>
              {locale === "es"
                ? "No se encontro ningun pais."
                : "No country found."}
            </CommandEmpty>
            <CommandGroup>
              {filteredCountries
                .filter((x) => x.name)
                .sort((a, b) =>
                  getCountryName(a.alpha2, locale).localeCompare(
                    getCountryName(b.alpha2, locale),
                    locale
                  )
                )
                .map((option) => (
                  <CommandItem
                    className="flex items-center w-full gap-2"
                    key={option.alpha2}
                    value={option.alpha2.toLowerCase()}
                    onSelect={() => handleSelect(option)}
                  >
                    <div className="flex flex-grow items-center gap-2 overflow-hidden">
                      <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
                        <CircleFlag
                          countryCode={option.alpha2.toLowerCase()}
                          height={20}
                        />
                      </div>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {getCountryName(option.alpha2, locale)}
                      </span>
                    </div>
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        selectedCountry?.alpha2 === option.alpha2
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

CountryDropdownComponent.displayName = "CountryDropdownComponent";

export const CountryDropdown = forwardRef(CountryDropdownComponent);
