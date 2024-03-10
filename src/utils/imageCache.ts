import { CacheResult } from "../types";
import { Response } from 'express';
import { resizeImage } from "./resizeImage";


export class ImageCache  {
    private static instance: ImageCache ;
    private cache: CacheResult = {
        cachedMap : new Map<string, Buffer>,
        cacheHits: 0,
        cacheMisses: 0,
        originalFilesNumber: 0
    } 

    constructor() {
        if (!!ImageCache .instance) {
            return ImageCache .instance;
        }

        ImageCache .instance = this;

        return this;
    }

    public incrementFileCount = () => {
        this.cache.originalFilesNumber++;
    }

    public getCached = () => {
        return this.cache;
    }

    public processAndSetCachedImage = async (cacheKey: string, inputPath: string, width: number, height: number, res: Response) => {
        if (this.cache.cachedMap.has(cacheKey)) {
            this.cache.cacheHits++;
            const processedImage = this.cache.cachedMap.get(cacheKey);
            res.send(processedImage);
          } else {
            this.cache.cacheMisses++;
            try {
                const processedImage = await resizeImage(inputPath, width, height);
                this.cache.cachedMap.set(cacheKey, processedImage);
                res.send(processedImage);
            } catch (error) {
                console.error("Error processing image:", error);
                res.status(500).json({ error: "Failed to process image" });
            }
           
            
          }
    }


}