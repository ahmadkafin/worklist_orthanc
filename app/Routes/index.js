import workListController from "./worklist.routes.js";

const routes = [
    workListController,
]

export default (app) => {
    routes.forEach(route => route(app));
}