import { CountryTradRaw, CountryTradResponse } from '../interfaces/country-trad.interface';

export function transformCountryTrad(raw: CountryTradRaw): CountryTradResponse {
  return {
    id: raw.ID,
    countryId: raw.COUNTRY_ID,
    languageId: raw.LANGUAGE_ID,
    name: raw.NAME,
    isActive: raw.IS_ACTIVE,
    country: {
      isoCode: raw.COUNTRY_ISO_CODE,
      isoCode3: raw.COUNTRY_ISO_CODE3,
      isActive: raw.COUNTRY_IS_ACTIVE,
      isDefault: raw.COUNTRY_IS_DEFAULT,
    },
    language: {
      isoCode: raw.LANGUAGE_ISO_CODE,
      name: raw.LANGUAGE_NAME,
      isActive: raw.LANGUAGE_IS_ACTIVE,
      isDefault: raw.LANGUAGE_IS_DEFAULT,
    },
    audit: {
      createdAt: raw.CREATED_AT,
      updatedAt: raw.UPDATED_AT,
      createdBy: raw.CREATED_BY,
      updatedBy: raw.UPDATED_BY,
    },
  };
}
