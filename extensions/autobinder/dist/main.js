"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.unload = exports.load = exports.methods = void 0;
//@ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    run: run
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
function load() {
    console.log("autobinder is loaded");
}
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() {
    console.log("autobinder is unloaded");
}
exports.unload = unload;
function run() {
    const options = {
        name: package_json_1.default.name,
        method: 'start',
        args: [null]
    };
    const result = Editor.Message.request('scene', 'execute-scene-script', options);
    console.log("call run");
    return result;
}
exports.run = run;
