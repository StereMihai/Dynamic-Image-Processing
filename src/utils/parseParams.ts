import { ParsedParams } from "../types";

export function parseParams(param: string): ParsedParams {
    console.log("AICI", param.split(' '))
    return {
        width: Number(param.split(' ')[0].split('x')[0]),
        height: Number(param.split(' ')[0].split('x')[1])
    }
}