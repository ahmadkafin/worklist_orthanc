import { configDotenv } from "dotenv";
configDotenv();

import * as WorkListController from "../Controllers/Worklist.controllers.js";

export default (app) => {
    app.post("/worklist", WorkListController.makeWorklist);
}