import Const from "./Const";
import type { ExecuteSceneScriptMethodOptions } from '../@types/packages/scene/@types/public';
//@ts-ignore
import packageJSON from '../package.json';
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    run:run
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() {
    console.log("autobinder is loaded");
 }

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() {
    console.log("autobinder is unloaded");
 }

export function run(){
    const options: ExecuteSceneScriptMethodOptions = {
        name: packageJSON.name,
        method: 'start',
        args:[null]
    };
    const result = Editor.Message.request('scene', 'execute-scene-script', options);
    console.log("call run");
    return result;
}
