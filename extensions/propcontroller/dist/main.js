"use strict";
// import { log, Node } from "cc";
// import { warn } from "cc";
// import {director} from "cc";
// import * as cc from "cc";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
//@ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    run() {
        const options = {
            name: package_json_1.default.name,
            method: 'start',
            args: [null]
        };
        const result = Editor.Message.request('scene', 'execute-scene-script', options);
        console.log("call run");
        return result;
    }
};
function load() {
    console.log("onload " + package_json_1.default.name);
    const options = {
        name: package_json_1.default.name,
        method: 'load',
        args: [null]
    };
    const result = Editor.Message.request('scene', 'execute-scene-script', options);
}
exports.load = load;
function unload() {
    console.log("unload propcontroler");
}
exports.unload = unload;
