export interface CountryTradRaw {
  ID: number;
  NAME: string;
  LANGUAGE_ID: number;
  LANGUAGE_ISO_CODE: string;
  LANGUAGE_NAME: string;
  LANGUAGE_IS_ACTIVE: number;
  LANGUAGE_IS_DEFAULT: number;
  COUNTRY_ID: number;
  COUNTRY_ISO_CODE: string;
  COUNTRY_ISO_CODE3: string;
  COUNTRY_IS_ACTIVE: number;
  COUNTRY_IS_DEFAULT: number;
  CREATED_AT: Date;
  UPDATED_AT: Date;
  CREATED_BY_ID: number;
  CREATED_BY_FIRST_NAME: string;
  CREATED_BY_LAST_NAME: string;
  UPDATED_BY_ID: number;
  UPDATED_BY_FIRST_NAME: string;
  UPDATED_BY_LAST_NAME: string;
}

export interface CountryTradTransformed {
  id: number;
  name: string;
  language: {
    id: number;
    isoCode: string;
    name: string;
    isActive: boolean;
    isDefault: boolean;
  };
  country: {
    id: number;
    isoCode: string;
    isoCode3: string;
    isActive: boolean;
    isDefault: boolean;
  };
  audit: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: number;
    createdByName?: string;
    updatedBy?: number;
    updatedByName?: string;
  };
}
