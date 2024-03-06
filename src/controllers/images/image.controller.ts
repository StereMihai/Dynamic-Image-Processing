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
  public cachedMap;
  public cacheHits;
  public cacheMisses;
  public originalFilesNumber;

  constructor() {
    this.initializeRoutes();
    this.cachedMap = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.originalFilesNumber = 0;
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
    const directoryPath = process.cwd() + "/uploads";

    fs.readdir(directoryPath, function (err, files) {
      const fileNames: string[] = [];
      if (err) {
        console.log(err);
        res.status(400).json({ err });
      }
      files.forEach(function (file) {
        fileNames.push(file);
      });

      res.status(200).json({ fileNames: files });
    });
  };

  private imageProcessing = async (req: Request, res: Response) => {
    const { filename } = req.params;
    const { width, height } = parseParams(req.query.resolution as string);

    const inputPath = process.cwd() + `/uploads/${filename}`;

    const fileExists = await checkFileExists(inputPath);

    if (!fileExists) {
      return res.status(400).json({ message: "File does not exists" });
    } else {
      const cacheKey = generateCacheKey(inputPath, width, height);

      if (this.cachedMap.has(cacheKey)) {
        console.log("CACHED");
        this.cacheHits++;
        const processedImage = this.cachedMap.get(cacheKey);
        res.send(processedImage);
      } else {
        console.log("NOT CACHED");
        this.cacheMisses++;
        const processedImage = await resizeImage(inputPath, width, height);
        this.cachedMap.set(cacheKey, processedImage);
        res.send(processedImage);
      }
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
    const totalNumberOfOriginalFiles = this.originalFilesNumber;

    res.json({
      totalImageProcessingRequests,
      hitRatio,
      missRatio,
      totalNumberOfOriginalFiles,
    });
  };
}

export default ImageController;
