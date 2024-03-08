import { Router, Response, Request } from "express";
import Controller from "../../interfaces/controller.interface";
import { ImageCache  } from "../../utils/imageCache";

class StatisticConstroller implements Controller {
    public path = "/statistics";
    public router = Router();
    private imageCache = new ImageCache ();

    constructor() {
        this.initializeRoutes();
      }
    
      private initializeRoutes() {
        this.router.get(`${this.path}`, this.getStatistics);
      }

      private getStatistics = async (req: Request, res: Response) => {
        const { cacheHits, cacheMisses, originalFilesNumber } = this.imageCache.getCached();
        const totalImageProcessingRequests = cacheHits + cacheMisses;

        const hitRatio =
      totalImageProcessingRequests === 0
        ? 0
        : (cacheHits / totalImageProcessingRequests) * 100;
    const missRatio =
      totalImageProcessingRequests === 0
        ? 0
        : (cacheMisses / totalImageProcessingRequests) * 100;
    
        res.json({
          totalImageProcessingRequests,
          hitRatio, 
          missRatio,
          originalFilesNumber
        });
      };
}

export default StatisticConstroller;