import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import Routes from "./app/Routes/index.js";
import db from "./app/Models/index.js";

configDotenv();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

Routes(app);
try {
    if (process.env.APP_ENV === "DEV") {
        await db.sequelize.sync({ alter: true });
        console.log('DB SYNC ON DEV SUCCESS');
    } else {
        await db.sequelize.authenticate();
        console.log('DB SYNC ON PROD SUCCESS');
    }

    app.listen(PORT, () => {
        console.log(`Server is running on PORT : ${PORT}`)
    })
} catch (e) {
    console.error("Error starting server:", e);
    process.exit(1);
}