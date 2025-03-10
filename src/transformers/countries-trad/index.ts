import {
  CountryTradRaw,
  CountryTradTransformed,
} from '../../interfaces/countries-trad';

export const transformCountriesTrad = (
  countryTrad: CountryTradRaw,
): CountryTradTransformed => {
  return {
    id: countryTrad.ID,
    name: countryTrad.NAME,
    language: {
      id: countryTrad.LANGUAGE_ID,
      isoCode: countryTrad.LANGUAGE_ISO_CODE,
      name: countryTrad.LANGUAGE_NAME,
      isActive: countryTrad.LANGUAGE_IS_ACTIVE === 1,
      isDefault: countryTrad.LANGUAGE_IS_DEFAULT === 1,
    },
    country: {
      id: countryTrad.COUNTRY_ID,
      isoCode: countryTrad.COUNTRY_ISO_CODE,
      isoCode3: countryTrad.COUNTRY_ISO_CODE3,
      isActive: countryTrad.COUNTRY_IS_ACTIVE === 1,
      isDefault: countryTrad.COUNTRY_IS_DEFAULT === 1,
    },
    audit: {
      createdAt: countryTrad.CREATED_AT,
      updatedAt: countryTrad.UPDATED_AT,
      createdBy: countryTrad.CREATED_BY_ID,
      createdByName: `${countryTrad.CREATED_BY_FIRST_NAME} ${countryTrad.CREATED_BY_LAST_NAME}`,
      updatedBy: countryTrad.UPDATED_BY_ID,
      updatedByName: `${countryTrad.UPDATED_BY_FIRST_NAME} ${countryTrad.UPDATED_BY_LAST_NAME}`,
    },
  };
};
