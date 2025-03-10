export const COUNTRIES_TRAD_QUERIES = {
  BASE_QUERY: `
    SELECT 
      c.ID, 
      c.NAME,
      l.ID as LANGUAGE_ID,
      l.ISO_CODE as LANGUAGE_ISO_CODE,
      l.NAME as LANGUAGE_NAME,
      l.IS_ACTIVE as LANGUAGE_IS_ACTIVE,
      l.IS_DEFAULT as LANGUAGE_IS_DEFAULT,
      co.ID as COUNTRY_ID,
      co.ISO_CODE as COUNTRY_ISO_CODE,
      co.ISO_CODE3 as COUNTRY_ISO_CODE3,
      co.IS_ACTIVE as COUNTRY_IS_ACTIVE,
      co.IS_DEFAULT as COUNTRY_IS_DEFAULT,
      c.CREATED_AT,
      c.UPDATED_AT,
      c.CREATED_BY,
      c.UPDATED_BY,
      u1.ID as CREATED_BY_ID,
      u1.FIRST_NAME as CREATED_BY_FIRST_NAME,
      u1.LAST_NAME as CREATED_BY_LAST_NAME,
      u2.ID as UPDATED_BY_ID,
      u2.FIRST_NAME as UPDATED_BY_FIRST_NAME,
      u2.LAST_NAME as UPDATED_BY_LAST_NAME
    FROM ECOMMERCE.COUNTRY_TRANSLATIONS c
    LEFT JOIN ECOMMERCE.LANGUAGES l ON l.ID = c.LANGUAGE_ID
    LEFT JOIN ECOMMERCE.COUNTRIES co ON co.ID = c.COUNTRY_ID
    LEFT JOIN ECOMMERCE.USERS u1 ON u1.ID = c.CREATED_BY
    LEFT JOIN ECOMMERCE.USERS u2 ON u2.ID = c.UPDATED_BY
  `,
};
