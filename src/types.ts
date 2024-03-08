export type ParsedParams = {
    width: number,
    height: number,
}

export type CacheResult = {
    cachedMap: Map<string, Buffer>,
    cacheHits: number,
    cacheMisses: number,
    originalFilesNumber: number,
}