"use client";

import { useState, forwardRef, useCallback, useMemo } from "react";
import parsePhoneNumber, {
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";
import { CircleFlag } from "react-circle-flags";
import { cn } from "@/lib/utils";
import { GlobeIcon, ChevronsUpDown, CheckIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  filteredCountries,
  getCountryName,
  type Country,
} from "@/lib/countries";

interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  defaultCountry?: string;
  locale?: string;
  className?: string;
}

function getCallingCode(alpha2: string): string {
  try {
    return "+" + getCountryCallingCode(alpha2.toUpperCase() as CountryCode);
  } catch {
    return "";
  }
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      className,
      onChange,
      value,
      placeholder,
      defaultCountry,
      locale = "es",
      disabled,
      ...props
    },
    ref
  ) => {
    const [displayFlag, setDisplayFlag] = useState<string>(
      () => defaultCountry?.toLowerCase() ?? ""
    );
    const [selectedCountryAlpha2, setSelectedCountryAlpha2] = useState<string>(
      () => defaultCountry?.toUpperCase() ?? ""
    );
    const [open, setOpen] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    const sortedCountries = useMemo(
      () =>
        filteredCountries
          .filter((x) => x.name)
          .sort((a, b) =>
            getCountryName(a.alpha2, locale).localeCompare(
              getCountryName(b.alpha2, locale),
              locale
            )
          ),
      [locale]
    );

    // Set default calling code on first focus if no value yet
    const handleFocus = useCallback(() => {
      if (!hasInitialized && defaultCountry && (!value || value === "+")) {
        const callingCode = getCallingCode(defaultCountry);
        if (callingCode) {
          const syntheticEvent = {
            target: { value: callingCode },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange?.(syntheticEvent);
          setHasInitialized(true);
        }
      }
    }, [hasInitialized, defaultCountry, value, onChange]);

    const handleCountrySelect = useCallback(
      (country: Country) => {
        const alpha2 = country.alpha2.toUpperCase();
        setSelectedCountryAlpha2(alpha2);
        setDisplayFlag(alpha2.toLowerCase());
        setOpen(false);
        setHasInitialized(true);

        const callingCode = getCallingCode(alpha2);
        if (!callingCode) return;

        // Extract national number from existing value if present
        let nationalPart = "";
        if (value) {
          try {
            const parsed = parsePhoneNumber(value);
            if (parsed) {
              nationalPart = parsed.nationalNumber;
            }
          } catch {
            nationalPart = value.replace(/^\+\d+\s*/, "");
          }
        }

        const newValue = nationalPart ? callingCode + nationalPart : callingCode;

        const syntheticEvent = {
          target: { value: newValue },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(syntheticEvent);
      },
      [value, onChange]
    );

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      // Ensure the value starts with "+"
      if (!newValue.startsWith("+")) {
        if (newValue.startsWith("00")) {
          newValue = "+" + newValue.slice(2);
        } else {
          newValue = "+" + newValue;
        }
      }

      try {
        const parsed = parsePhoneNumber(newValue);

        if (parsed && parsed.country) {
          setDisplayFlag(parsed.country.toLowerCase());
          setSelectedCountryAlpha2(parsed.country);

          const syntheticEvent = {
            ...e,
            target: { ...e.target, value: parsed.number },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange?.(syntheticEvent);
        } else {
          onChange?.({
            ...e,
            target: { ...e.target, value: newValue },
          } as React.ChangeEvent<HTMLInputElement>);
          if (!newValue || newValue === "+") {
            setDisplayFlag(defaultCountry?.toLowerCase() ?? "");
            setSelectedCountryAlpha2(defaultCountry?.toUpperCase() ?? "");
          }
        }
      } catch {
        onChange?.({
          ...e,
          target: { ...e.target, value: newValue },
        } as React.ChangeEvent<HTMLInputElement>);
        setDisplayFlag("");
        setSelectedCountryAlpha2("");
      }
    };

    return (
      <div
        className={cn(
          "flex items-center relative bg-white transition-colors text-base rounded-md border border-slate-200 h-10 shadow-sm md:text-sm has-[input:focus]:outline-none has-[input:focus]:ring-1",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        style={{ "--tw-ring-color": "#E8501C" } as React.CSSProperties}
      >
        {/* Country code selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            disabled={disabled}
            className={cn(
              "flex items-center gap-1 pl-3 pr-2 h-full shrink-0 rounded-l-md",
              "hover:bg-slate-50 transition-colors",
              "focus:outline-none",
              disabled && "pointer-events-none"
            )}
            type="button"
            aria-label={
              locale === "es"
                ? "Seleccionar codigo de pais"
                : "Select country code"
            }
          >
            <div className="w-5 h-5 rounded-full shrink-0 overflow-hidden">
              {displayFlag ? (
                <CircleFlag countryCode={displayFlag} height={20} />
              ) : (
                <GlobeIcon className="h-5 w-5 text-slate-400" />
              )}
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400" />
          </PopoverTrigger>
          <PopoverContent
            collisionPadding={10}
            side="bottom"
            align="start"
            className="min-w-[280px] p-0"
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
                const callingCode = country.countryCallingCodes?.[0] ?? "";
                const term = search.toLowerCase();
                if (
                  localizedName.includes(term) ||
                  englishName.includes(term) ||
                  country.alpha2.toLowerCase().includes(term) ||
                  callingCode.includes(term)
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
                  {sortedCountries.map((option) => (
                    <CommandItem
                      className="flex items-center w-full gap-2"
                      key={option.alpha2}
                      value={option.alpha2.toLowerCase()}
                      onSelect={() => handleCountrySelect(option)}
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
                        <span className="text-xs text-slate-400 ml-auto shrink-0">
                          {option.countryCallingCodes?.[0]}
                        </span>
                      </div>
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4 shrink-0",
                          selectedCountryAlpha2 === option.alpha2
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

        {/* Separator */}
        <div className="h-5 w-px bg-slate-200 shrink-0" />

        {/* Phone input */}
        <input
          ref={ref}
          value={value}
          onChange={handlePhoneChange}
          onFocus={handleFocus}
          placeholder={placeholder || "+504 9999-0000"}
          type="tel"
          autoComplete="tel"
          disabled={disabled}
          className="flex w-full border-none bg-transparent text-sm transition-colors placeholder:text-muted-foreground outline-none h-10 py-1 px-2 leading-none disabled:cursor-not-allowed"
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
