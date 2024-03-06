export const generateCacheKey = (inputPath: string, width: number, height: number) => {
    return  `${inputPath}-${width}x${height}`
}