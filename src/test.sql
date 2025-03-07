/* Name            Null?    Type              
--------------- -------- ----------------- 
EMPLOYEE_ID     NOT NULL NUMBER            
FIRST_NAME      NOT NULL VARCHAR2(50)      
LAST_NAME       NOT NULL VARCHAR2(50)      
EMAIL           NOT NULL VARCHAR2(100)     
PASSWORD_HASH   NOT NULL VARCHAR2(255)     
PHONE                    PHONE_NUMBER_TYPE 
ROLE            NOT NULL VARCHAR2(50)      
DEPARTMENT               VARCHAR2(50)      
HIRE_DATE                DATE              
IS_ACTIVE                NUMBER(1)         
LAST_LOGIN_DATE          TIMESTAMP(6)      
CREATED_AT               TIMESTAMP(6)      
UPDATED_AT               TIMESTAMP(6)   */

insert into employees (first_name, last_name, email, password_hash, phone, role, department, hire_date, is_active, last_login_date)
values ('Rafael', 'Álvarez', 'alvnavra@gmail.com', '$2b$10$2kEZTgYDSVJMNyIC2CyX.u3462FOUHIxf6WebRl6iKV4skgAAvvZG', phone_number_type('+34', '626', '430093', NULL), 'ADMIN', 'IT', sysdate, 1, sysdate);

commit;