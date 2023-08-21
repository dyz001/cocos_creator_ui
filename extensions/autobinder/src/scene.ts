import { basename, join } from 'path';
import Const from "./Const";
import {existsSync} from 'fs';
module.paths.push(join(Editor.App.path, 'node_modules'));
//@ts-ignore
import { director, Node } from "cc";
export function load() { };
export function unload() { };
enum FormType {
    /** 屏幕 */
    Screen ,
    /** 固定窗口 */
    Fixed,
    /** 弹出窗口 */
    Window,
    /** Toast */
    Toast,
    /** 独立窗口 */
    Tips,

}
export const methods = {
    getImportPath(exportPath: string, currPath: string): string {
        exportPath = exportPath.replace(/\\/g, "/").substring(0, exportPath.lastIndexOf("."));
        currPath = currPath.replace(/\\/g, "/");
        let tmp = "./";
        let start: number, end: number;
        let exportStr = exportPath.split("/");
        let currStr = currPath.split("/");
        for (end = 0; end < exportStr.length; ++end) {
            if (exportStr[end] != currStr[end]) {
                break;
            }
        }
        for (start = end + 1; start < currStr.length; ++start) {
            tmp += "../";
        }
        for (start = end; start < exportStr.length; ++start) {
            tmp += `${exportStr[start]}/`;
        }
        tmp = tmp.substring(0, tmp.length - 1);
        return tmp;
    },
    createControl(){
        let childs = director.getScene().children;
        if(childs.length < 3) return null;
        let NodeRoot = childs[0].children[1];
        let ScriptName = `${NodeRoot.name}_Auto`;
        let auto = NodeRoot.getComponent(ScriptName);
        if(!auto){
            console.error("no autoscripts found");
            return;
        }

        let path = "db://" + Const.ControlScriptPath + "/" + auto.controlName + ".ts";
        let extendFrom = "";
        switch(auto.formType){
            case FormType.Fixed:{
                extendFrom = "UIFixed";
                break;
            }
            case FormType.Screen:{
                extendFrom = "UIScreen";
                break;
            }
            case FormType.Window:{
                extendFrom = "UIWindow";
                break;
            }
            case FormType.Tips:{
                extendFrom = "UITips";
                break;
            }
            case FormType.Toast:{
                extendFrom = "UIToast";
                break;
            }
        }
        if(!extendFrom){
            console.error("cant find baseclass");
            return;
        }
        let content = `import { ${extendFrom} } from '../UIFrame/UIForm'\nexport class ${NodeRoot.name} extends ${extendFrom}{\n\n}`;
        
        Editor.Message.request("asset-db", "create-asset", path, content);

    },
    async start(){
        let childs = director.getScene().children;
        if(childs.length < 3) return null;
        let target_scene = childs[0];
        childs.forEach((n:Node) => {
            if(n.name == "should_hide_in_hierarchy"){
                target_scene = n;
            }
        });
        let NodeRoot = target_scene.children[1];
        let ProjectDir = Editor.Project.path;
        let ScriptName = `${NodeRoot.name}_Auto`;
        let ScriptPath = `${ProjectDir}/${Const.ScriptsDir}/${ScriptName}.ts`.replace(/\\/g, "/");
        
        console.log("script path:" + ScriptPath);
        let nodeMaps: {[key: string]: string[]} = {}, importMaps: {[key: string]: string} = {};
        this.findNodes(NodeRoot, nodeMaps,  importMaps);
        
        let _str_import = `import * as cc from "cc";\nimport { UIAuto } from "../UIFrame/UIAuto";`;
        for(let key in importMaps) {
            _str_import += `import ${key} from "${this.getImportPath(importMaps[key], ScriptPath)}"\n`;
        }
        let _str_content = ``;
        for(let key in nodeMaps) {
            let type = nodeMaps[key][0];
            _str_content += `\t@property(${type})\n\t${key}: ${type} = null;\n`;
        }
        
        let strScript = `${_str_import}
const {ccclass, property} = cc._decorator;
@ccclass
export default class ${ScriptName} extends UIAuto {
${_str_content} 
}`; 

        let dbScriptPath = ScriptPath.replace(Editor.Project.path.replace(/\\/g, "/"), "db:/");
        let ret = await this.saveFile(dbScriptPath, strScript);
        if(ret){
            let comp = NodeRoot.getComponent(ScriptName);
            if(!comp) {
                //@ts-ignore
                if(!cc.js.getClassByName(ScriptName)) {
                    console.warn("script not found, pls run again");
                    return ;
                }
                comp = NodeRoot.addComponent(ScriptName);
            }
            for(let key in nodeMaps) {
                let node = nodeMaps[key][2] as Node;
                if(nodeMaps[key][0] == 'cc.Node') {
                    comp[key] = node;
                }else {
                    comp[key] = node.getComponent(nodeMaps[key][0]);
                }
            }  
            comp["controlName"] = NodeRoot.name;
            console.log(ScriptName + '.ts success'); 
        }
    },

    getPrefixNames(name: string) {
        if(name === null) {
            return '';
        }
        return name.substring(1, name.length).split(Const.STANDARD_Separator); 
    },
    checkBindChildren(name: string) {
        if(name[name.length-1] !== Const.STANDARD_End) {
            return true;
        }
        return false;
    },
    checkNodePrefix(name: string) {
        if(name[0] !== Const.STANDARD_Prefix) {
            return false;
        }
        return true;
    },
    saveFile(dbPath: string, strScript: string) {
        return Editor.Message.request("asset-db", "create-asset", dbPath, strScript, {overwrite:true});
    },
    async findNodes(node: Node, _nodeMaps: {[key: string]: string[]}, _importMaps: {[key: string]: string}) {
        let name = node.name;
        if(this.checkBindChildren(name)) {
            if(this.checkNodePrefix(name)) {
                // 获得这个组件的类型 和 名称
                let names = this.getPrefixNames(name);
                if(names === null || names.length !== 2) {
                    console.log(`${name} 命令不规范, 请使用_Label$xxx的格式!, 或者是在SysDefine中没有定义`);
                    return ;
                }
                let type = Const.SeparatorMap[names[0]] || names[0];
                let value = names[1];
                // 进入到这里， 就表示可以绑定了
                if(_nodeMaps[value]) {
                    console.log("duplicate name:", value);
                }
                _nodeMaps[value] = [type, node.uuid, node];
                // 检查是否是自定义组件
                if(!_importMaps[type] && type.indexOf("cc.") === -1 && node.getComponent(type)) {
                    let componentPath = await Editor.Message.request("asset-db", "query_path", node.getComponent(type).uuid);
                    // let componentPath = Editor.remote.assetdb.uuidToFspath(node.getComponent(type).__scriptUuid);
                    componentPath = componentPath.replace(/\s*/g, "").replace(/\\/g, "/");
                    _importMaps[type] = componentPath;
                }
            }
            // 绑定子节点
            node.children.forEach((target: Node) => {
                this.findNodes(target, _nodeMaps, _importMaps);
            });
        }
    }
};