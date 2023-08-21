// import { log, Node } from "cc";
// import { warn } from "cc";
// import {director} from "cc";
// import * as cc from "cc";

import { ExecuteSceneScriptMethodOptions } from "../@types/packages/scene/@types/public";
//@ts-ignore
import packageJSON from '../package.json';

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    run(){
        const options: ExecuteSceneScriptMethodOptions = {
            name: packageJSON.name,
            method: 'start',
            args:[null]
        };
        const result = Editor.Message.request('scene', 'execute-scene-script', options);
        console.log("call run");
        return result;
    }    
};

export function load() {
    console.log("onload " + packageJSON.name);
    const options: ExecuteSceneScriptMethodOptions = {
        name: packageJSON.name,
        method: 'load',
        args:[null]
    };
    const result = Editor.Message.request('scene', 'execute-scene-script', options);
}

export function unload(){
    console.log("unload propcontroler");
}


