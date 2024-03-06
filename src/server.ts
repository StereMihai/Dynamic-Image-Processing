import dotenv from "dotenv";
import App from "./app";
import ImageController from "./controllers/images/image.controller";
dotenv.config();

const app = new App([new ImageController()]);

app.listen();