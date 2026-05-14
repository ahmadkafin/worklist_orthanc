import { configDotenv } from "dotenv"
configDotenv();

export default {
    HOST: process.env.PGHOST,
    USER: process.env.PGUSERNAME,
    PASSWORD: process.env.PGPASS,
    DB: process.env.PGDB,
    PORT: process.env.PGPORT,
    SCHEMA: process.env.PGSCHEMA,
    DIALECT: process.env.PGDIALECT,
}