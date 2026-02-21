import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import esLocale from 'i18n-iso-countries/langs/es.json';

countries.registerLocale(enLocale);
countries.registerLocale(esLocale);

export const DEFAULT_COUNTRY_CODE = 'HN';
export const DEFAULT_PHONE_CODE = '+504';

/** E.164 dialing codes for the countries we support */
const PHONE_CODES: Record<string, string> = {
  HN: '+504', GT: '+502', SV: '+503', NI: '+505', CR: '+506',
  PA: '+507', BZ: '+501', MX: '+52', CO: '+57', PE: '+51',
  CL: '+56', AR: '+54', BR: '+55', EC: '+593', BO: '+591',
  PY: '+595', UY: '+598', VE: '+58', DO: '+1', PR: '+1',
  US: '+1', CA: '+1', ES: '+34', GB: '+44', DE: '+49', FR: '+33',
};

/** ISO alpha-2 codes we expose in the UI, ordered by priority */
const SUPPORTED_CODES = Object.keys(PHONE_CODES);

export interface CountryEntry {
  code: string;
  phone_code: string;
}

/** Get localized country name for a given ISO code */
export function getCountryName(code: string, locale: string): string {
  return countries.getName(code, locale) ?? code;
}

/** All supported countries with their phone codes */
export const supportedCountries: CountryEntry[] = SUPPORTED_CODES.map((code) => ({
  code,
  phone_code: PHONE_CODES[code],
}));

/** Lookup phone code by ISO alpha-2 code */
export function getPhoneCode(code: string): string {
  return PHONE_CODES[code] ?? '';
}
