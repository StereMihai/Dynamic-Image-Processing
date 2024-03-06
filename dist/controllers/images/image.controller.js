"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadFile_middleware_1 = require("../../middleware/uploadFile.middleware");
const fs_1 = __importDefault(require("fs"));
const parseParams_1 = require("../../utils/parseParams");
const resizeImage_1 = require("../../utils/resizeImage");
const generateCacheKey_1 = require("../../utils/generateCacheKey");
const checkFileExists_1 = require("../../utils/checkFileExists");
class ImageController {
    constructor() {
        this.path = "/images";
        this.router = (0, express_1.Router)();
        this.uploadFile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const documentFile = req.file;
            this.originalFilesNumber++;
            if (!documentFile) {
                return res.status(400).json({ error: "No file uploaded" });
            }
            res.status(200).json({ message: "File uploaded successfully" });
        });
        this.getAllFileNames = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const directoryPath = process.cwd() + "/uploads";
            fs_1.default.readdir(directoryPath, function (err, files) {
                const fileNames = [];
                if (err) {
                    console.log(err);
                    res.status(400).json({ err });
                }
                files.forEach(function (file) {
                    fileNames.push(file);
                });
                res.status(200).json({ fileNames: files });
            });
        });
        this.imageProcessing = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { filename } = req.params;
            const { width, height } = (0, parseParams_1.parseParams)(req.query.resolution);
            const inputPath = process.cwd() + `/uploads/${filename}`;
            const fileExists = yield (0, checkFileExists_1.checkFileExists)(inputPath);
            if (!fileExists) {
                return res.status(400).json({ message: "File does not exists" });
            }
            else {
                const cacheKey = (0, generateCacheKey_1.generateCacheKey)(inputPath, width, height);
                if (this.cachedMap.has(cacheKey)) {
                    console.log("CACHED");
                    this.cacheHits++;
                    const processedImage = this.cachedMap.get(cacheKey);
                    res.send(processedImage);
                }
                else {
                    console.log("NOT CACHED");
                    this.cacheMisses++;
                    const processedImage = yield (0, resizeImage_1.resizeImage)(inputPath, width, height);
                    this.cachedMap.set(cacheKey, processedImage);
                    res.send(processedImage);
                }
            }
        });
        this.getStatistics = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const totalImageProcessingRequests = this.cacheHits + this.cacheMisses;
            const hitRatio = totalImageProcessingRequests === 0
                ? 0
                : (this.cacheHits / totalImageProcessingRequests) * 100;
            const missRatio = totalImageProcessingRequests === 0
                ? 0
                : (this.cacheMisses / totalImageProcessingRequests) * 100;
            const totalNumberOfOriginalFiles = this.originalFilesNumber;
            res.json({
                totalImageProcessingRequests,
                hitRatio,
                missRatio,
                totalNumberOfOriginalFiles,
            });
        });
        this.initializeRoutes();
        this.cachedMap = new Map();
        this.cacheHits = 0;
        this.cacheMisses = 0;
        this.originalFilesNumber = 0;
    }
    initializeRoutes() {
        this.router.get(this.path, this.getAllFileNames);
        this.router.get(`${this.path}/file/:filename`, this.imageProcessing);
        this.router.get(`${this.path}/statistics`, this.getStatistics);
        this.router.post(this.path, uploadFile_middleware_1.upload.single("file"), this.uploadFile);
    }
}
exports.default = ImageController;
