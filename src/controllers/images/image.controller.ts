import { Router, Response, Request } from "express";
import Controller from "../../interfaces/controller.interface";
import MulterRequest from "../../interfaces/multer.interface";
import { upload } from "../../middleware/uploadFile.middleware";
import fs from "fs";
import { parseParams } from "../../utils/parseParams";
import { generateCacheKey } from "../../utils/generateCacheKey";
import { checkFileExists } from "../../utils/checkFileExists";
import { ImageCache } from "../../utils/imageCache";

class ImageController implements Controller {
  public path = "/images";
  public router = Router();
  public cachedMap = new Map<string, Buffer>(); // Use specific types for cachedMap
  public cacheHits = 0;
  public cacheMisses = 0;
  public originalFilesNumber = 0;
  private imageCache = new ImageCache();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllFileNames);
    this.router.get(`${this.path}/:filename`, this.imageProcessing);
    this.router.post(this.path, upload.single("file"), this.uploadFile);
    this.router.delete(`${this.path}/:filename`, this.deleteImage)
  }

  private uploadFile = async (req: Request, res: Response) => {
    const documentFile = (req as MulterRequest).file;
    this.imageCache.incrementFileCount();
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

    const inputPath = process.cwd() + `/uploads/${filename}`;

    if (!req.query.resolution) {
      const imageContent = Buffer.from(inputPath, "base64");

      return res.send(imageContent);
    }

    const resolutionParams = (req.query.resolution as string);
    const regex = /^\d+x\d+$/;
    const match = resolutionParams.match(regex);

    if (!match) {
      return res.status(400).json({message: 'Incorrect format for query string'})
    }

    const { width, height } = parseParams(resolutionParams);

    const fileExists = await checkFileExists(inputPath);

    if (!fileExists) {
      return res.status(404).json({ message: "File not found" });
    }

    const cacheKey = generateCacheKey(inputPath, width, height);

    await this.imageCache.processAndSetCachedImage(
      cacheKey,
      inputPath,
      width,
      height,
      res
    );
  };

  private deleteImage = async (req: Request, res: Response) => {
    const { filename } = req.params;

    const inputPath = process.cwd() + `/uploads/${filename}`;

    const fileExists = await checkFileExists(inputPath);

    if (!fileExists) {
      return res.status(404).json({ message: "File not found" });
    }

    fs.unlink(inputPath, (err) => {
      if (err) {
        console.error('Error deleting file', err)
        return res.status(400).json({message: "Error deleting file"});
      }
      res.status(200).json({message: "File successfully deleted"})
    })
  }
  
}

export default ImageController;
