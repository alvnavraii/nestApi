import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'oracle',
  username: process.env.BD_USER || 'ecommerce',
  password: process.env.BD_PASSWORD || 'PwdLota5971!',
  connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.BD_HOST})(PORT=${process.env.BD_PORT}))(CONNECT_DATA=(SERVICE_NAME=${process.env.BD_SERVICE_NAME})))`,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  logging: true,
});
