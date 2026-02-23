import isoCountries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import esLocale from 'i18n-iso-countries/langs/es.json';
import { countries } from 'country-data-list';

isoCountries.registerLocale(enLocale);
isoCountries.registerLocale(esLocale);

export const DEFAULT_COUNTRY_CODE = 'HN';

/** Shared Country type (from country-data-list) */
export type Country = {
  alpha2: string;
  alpha3: string;
  countryCallingCodes: string[];
  currencies: string[];
  emoji?: string;
  ioc: string;
  languages: string[];
  name: string;
  status: string;
};

/** All valid countries, filtered to exclude deleted/emoji-less/North Korea */
export const filteredCountries: Country[] = countries.all.filter(
  (country: Country) =>
    country.emoji && country.status !== 'deleted' && country.ioc !== 'PRK'
);

/** Look up a country by alpha2 code */
export function findCountryByAlpha2(alpha2: string): Country | undefined {
  return filteredCountries.find(
    (c) => c.alpha2.toLowerCase() === alpha2.toLowerCase()
  );
}

/** Look up a country by alpha3 code */
export function findCountryByAlpha3(alpha3: string): Country | null {
  return filteredCountries.find((c) => c.alpha3 === alpha3) ?? null;
}

/** Get localized country name for a given ISO alpha-2 code */
export function getCountryName(code: string, locale: string): string {
  return isoCountries.getName(code, locale) ?? code;
}
