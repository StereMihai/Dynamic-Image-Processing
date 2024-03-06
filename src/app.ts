import express from 'express';
import * as bodyParser from 'body-parser';
import Controller from './interfaces/controller.interface';


class App {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();

        this.initializeMiddleware();
        this.initializeControllers(controllers);
    }

    public listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    }

    public getServer() {
        return this.app;
    }

    private initializeMiddleware() {
        this.app.use(bodyParser.urlencoded({extended:true}))
        this.app.use(bodyParser.json());
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router)
        })
    }
}

export default App;