"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCacheKey = void 0;
const generateCacheKey = (inputPath, width, height) => {
    return `${inputPath}-${width}x${height}`;
};
exports.generateCacheKey = generateCacheKey;
