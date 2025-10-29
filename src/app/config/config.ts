import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  database_name: process.env.DATABASE_NAME,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_access_expiration: process.env.JWT_ACCESS_EXPIRATION,
  store_id: process.env.STORE_ID,
  store_pass: process.env.STORE_PASS,
  base_url: process.env.BASE_URL,
  client_url: process.env.CLIENT_URL,
};
