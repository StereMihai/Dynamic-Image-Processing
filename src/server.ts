import dotenv from "dotenv";
import App from "./app";
import ImageController from "./controllers/images/image.controller";
import StatisticConstroller from "./controllers/statistics/statistic.controller";
dotenv.config();

const app = new App([new ImageController(), new StatisticConstroller()]);

app.listen();