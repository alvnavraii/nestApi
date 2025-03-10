export interface CountryTradRaw {
  ID: number;
  COUNTRY_ID: number;
  LANGUAGE_ID: number;
  NAME: string;
  IS_ACTIVE: number;
  CREATED_AT: Date;
  UPDATED_AT: Date | null;
  CREATED_BY: number | null;
  UPDATED_BY: number | null;
  COUNTRY_ISO_CODE: string;
  COUNTRY_ISO_CODE3: string;
  COUNTRY_IS_ACTIVE: number;
  COUNTRY_IS_DEFAULT: number;
  LANGUAGE_ISO_CODE: string;
  LANGUAGE_NAME: string;
  LANGUAGE_IS_ACTIVE: number;
  LANGUAGE_IS_DEFAULT: number;
}

export interface CountryTradResponse {
  id: number;
  countryId: number;
  languageId: number;
  name: string;
  isActive: number;
  country: {
    isoCode: string;
    isoCode3: string;
    isActive: number;
    isDefault: number;
  };
  language: {
    isoCode: string;
    name: string;
    isActive: number;
    isDefault: number;
  };
  audit: {
    createdAt: Date;
    updatedAt: Date | null;
    createdBy: number | null;
    updatedBy: number | null;
  };
}
