import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import Routes from "./app/Routes/index.js";

configDotenv();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

Routes(app);
try {
    app.listen(PORT, () => {
        console.log(`Server is running on PORT : ${PORT}`)
    })
} catch (e) {
    console.error("Error starting server:", e);
    process.exit(1);
}