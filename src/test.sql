alter table countries add is_default number(1) default 0;

desc countries;

desc country_translations;

desc languages;

alter table languages rename column code to iso_code;

-- Establecer el identificador de sesión para auditoría
BEGIN
  DBMS_SESSION.SET_IDENTIFIER('1');
END;
/

-- Inserts de prueba para traducciones de países
INSERT INTO COUNTRY_TRANSLATIONS (
    COUNTRY_ID,
    LANGUAGE_ID,
    NAME
) VALUES (
    1, -- ID del país España
    1, -- ID del idioma Español
    'España'
);

INSERT INTO COUNTRY_TRANSLATIONS (
    COUNTRY_ID,
    LANGUAGE_ID,
    NAME
) VALUES (
    1, -- ID del país España
    2, -- ID del idioma Inglés
    'Spain'
);

INSERT INTO COUNTRY_TRANSLATIONS (
    COUNTRY_ID,
    LANGUAGE_ID,
    NAME
) VALUES (
    3, -- ID del país Francia
    1, -- ID del idioma Español
    'Francia'
);

INSERT INTO COUNTRY_TRANSLATIONS (
    COUNTRY_ID,
    LANGUAGE_ID,
    NAME
) VALUES (
    3, -- ID del país Francia
    2, -- ID del idioma Inglés
    'France'
);

-- Commit para guardar los cambios
COMMIT;

-- Limpiar el identificador de sesión
BEGIN
  DBMS_SESSION.CLEAR_IDENTIFIER;
END;
/

select * from country_translations;


select * from countries;

BEGIN
  DBMS_SESSION.SET_IDENTIFIER('1');
  update COUNTRY_TRANSLATIONS set country_id = 3 where COUNTRY_ID = 2;
  commit;
  DBMS_SESSION.CLEAR_IDENTIFIER;
END;
/
BEGIN
  DBMS_SESSION.SET_IDENTIFIER('1');
  update COUNTRY_TRANSLATIONS set country_id = 1 where COUNTRY_ID = 2;
  commit;
  DBMS_SESSION.CLEAR_IDENTIFIER;
END;
/

TRUNCATE TABLE COUNTRY_TRANSLATIONS;



BEGIN
  DBMS_SESSION.CLEAR_IDENTIFIER;
END;
/