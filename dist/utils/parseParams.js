"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseParams = void 0;
function parseParams(param) {
    console.log("AICI", param.split(' '));
    return {
        width: Number(param.split(' ')[0].split('x')[0]),
        height: Number(param.split(' ')[0].split('x')[1])
    };
}
exports.parseParams = parseParams;
