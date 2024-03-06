import { Router, Response, Request } from "express";
import Controller from "../../interfaces/controller.interface";
import MulterRequest from "../../interfaces/multer.interface";
import { upload } from "../../middleware/uploadFile.middleware";
import fs from "fs";
import { parseParams } from "../../utils/parseParams";
import { resizeImage } from "../../utils/resizeImage";
import { generateCacheKey } from "../../utils/generateCacheKey";
import { checkFileExists } from "../../utils/checkFileExists";

class ImageController implements Controller {
  public path = "/images";
  public router = Router();
  public cachedMap = new Map<string, Buffer>(); // Use specific types for cachedMap
  public cacheHits = 0;
  public cacheMisses = 0;
  public originalFilesNumber = 0;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllFileNames);
    this.router.get(`${this.path}/file/:filename`, this.imageProcessing);
    this.router.get(`${this.path}/statistics`, this.getStatistics);
    this.router.post(this.path, upload.single("file"), this.uploadFile);
  }

  private uploadFile = async (req: Request, res: Response) => {
    const documentFile = (req as MulterRequest).file;
    this.originalFilesNumber++;
    if (!documentFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.status(200).json({ message: "File uploaded successfully" });
  };

  private getAllFileNames = async (req: Request, res: Response) => {
    try {
      const directoryPath = process.cwd() + "/uploads";
      const files = await fs.promises.readdir(directoryPath);
      res.status(200).json({ fileNames: files });
    } catch (error) {
      console.error("Error reading directory:", error);
      res.status(500).json({ error: "Failed to read directory" });
    }
  };

  private imageProcessing = async (req: Request, res: Response) => {
    const { filename } = req.params;
    const { width, height } = parseParams(req.query.resolution as string);

    const inputPath = process.cwd() + `/uploads/${filename}`;

    try {
      const fileExists = await checkFileExists(inputPath);
      if (!fileExists) {
        return res.status(404).json({ message: "File not found" });
      }

      const cacheKey = generateCacheKey(inputPath, width, height);

      if (this.cachedMap.has(cacheKey)) {
        this.cacheHits++;
        const processedImage = this.cachedMap.get(cacheKey);
        res.send(processedImage);
      } else {
        this.cacheMisses++;
        const processedImage = await resizeImage(inputPath, width, height);
        this.cachedMap.set(cacheKey, processedImage);
        res.send(processedImage);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ error: "Failed to process image" });
    }
  };

  private getStatistics = async (req: Request, res: Response) => {
    const totalImageProcessingRequests = this.cacheHits + this.cacheMisses;
    const hitRatio =
      totalImageProcessingRequests === 0
        ? 0
        : (this.cacheHits / totalImageProcessingRequests) * 100;
    const missRatio =
      totalImageProcessingRequests === 0
        ? 0
        : (this.cacheMisses / totalImageProcessingRequests) * 100;

    res.json({
      totalImageProcessingRequests,
      hitRatio,
      missRatio,
      totalNumberOfOriginalFiles: this.originalFilesNumber,
    });
  };
}

export default ImageController;
