"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = void 0;
//@ts-ignore
const fs = require('fs');
//@ts-ignore
const path = require('path');
const Const_1 = __importDefault(require("./Const"));
const ProjectPath = Editor.Project.path;
let map = {};
exports.methods = {
    async start() {
        console.log(`正在读取配置文件: ${ProjectPath}\\${Const_1.default.ConfigUrl} 请稍等.`);
        let config = fs.readFileSync(`${ProjectPath}\\${Const_1.default.ConfigUrl}`);
        if (!config) {
            console.log(`读取配置文件失败:${ProjectPath}\\${Const_1.default.ConfigUrl}`);
            return;
        }
        config = JSON.parse(config);
        let ProjectDir = Editor.Project.path;
        let FormsPath = `${ProjectDir}/${config.FormsDir}`.replace(/\\/g, "/");
        let ConfigPath = `${ProjectDir}/${config.ScriptsDir}/${config.ScriptsName}`.replace(/\\/g, "/");
        let importContent = "import * as cc from \"cc\";\nimport { EDITOR } from \"cc/env\";\n";
        await this.walkDirSync(FormsPath, async (prefabUrl, stat) => {
            let prefab = fs.readFileSync(prefabUrl);
            let prefabJson = JSON.parse(prefab);
            let idx = prefabJson.length;
            let targetObj = null;
            while (--idx >= 0) {
                let obj = prefabJson[idx];
                let uuidZip = obj.__type__;
                if (uuidZip.indexOf("cc.") == -1) {
                    if (obj["controlName"]) {
                        targetObj = obj;
                        break;
                    }
                }
            }
            if (!targetObj) {
                console.warn("no controlname:" + prefabUrl);
                return null;
            }
            let controlName = targetObj["controlName"];
            let type = this.getPrefabType(controlName, `${ProjectDir}/${config.ScriptsDir}`);
            if (!type)
                return null;
            let baseName = path.basename(prefabUrl).split(".")[0];
            map[baseName] = {
                prefabUrl: this.getResourcesUrl(prefabUrl),
                type: type
            };
            if (controlName) {
                map[baseName].controlName = controlName;
                importContent += `import {${controlName}} from "./${Const_1.default.ControlImportFolder}/${controlName}";\n`;
            }
            return null;
        });
        let contentStr = ``;
        for (const key in map) {
            contentStr += `static ${key} = {
                prefabUrl: "${map[key].prefabUrl}",
                type: "${map[key].type}"`;
            if (map[key].controlName) {
                contentStr += `,
                control: ${map[key].controlName}`;
            }
            contentStr += `
            };
            `;
        }
        let strScript = `${importContent}
export default class UIConfig {
    ${contentStr}
}
cc.game.on(cc.Game.EVENT_GAME_INITED, () => {
    if(EDITOR) return;
    for(const key in UIConfig) { 
        /*let constourt = cc.js.getClassByName(key);
        if(!constourt) {
            let urls = UIConfig[key].prefabUrl.split('/') as string[];
            if(!urls || urls.length <= 0) continue;
            let name = urls[urls.length-1];
            constourt = cc.js.getClassByName(name);
        }
        constourt['UIConfig'] = UIConfig[key];*/
        UIConfig[key].control['UIConfig'] = UIConfig[key];
    }
});
`;
        let dbConfigPath = ConfigPath.replace(Editor.Project.path.replace(/\\/g, "/"), "db:/");
        await this.saveFile(dbConfigPath, strScript);
        console.log(`生成${config.ScriptsName}文件成功`);
    },
    saveFile(dbPath, strScript) {
        return Editor.Message.request("asset-db", "create-asset", dbPath, strScript, { overwrite: true });
    },
    getResourcesUrl(fileUrl) {
        let url = `${Editor.Project.path}/assets/resources/`.replace(/\\/g, "/");
        fileUrl = fileUrl.replace(/\\/g, "/");
        console.log(fileUrl, url);
        return fileUrl.replace(url, "").split('.')[0];
    },
    getPrefabType(controlName, scriptsDir) {
        if (!fs.existsSync) {
            console.error("no sync function");
            return "";
        }
        if (!fs.existsSync(`${scriptsDir}/${Const_1.default.ControlImportFolder}/${controlName}.ts`)) {
            console.warn(`${scriptsDir}/${Const_1.default.ControlImportFolder}/${controlName}.ts not exist`);
            return "";
        }
        let datastr = fs.readFileSync(`${scriptsDir}/${Const_1.default.ControlImportFolder}/${controlName}.ts`);
        if (datastr.indexOf("extends UIScreen") >= 0) {
            return "UIScreen";
        }
        else if (datastr.indexOf("extends UIWindow") >= 0) {
            return "UIWindow";
        }
        else if (datastr.indexOf("extends UIFixed") >= 0) {
            return "UIFixed";
        }
        else if (datastr.indexOf("extends UITips") >= 0) {
            return "UITips";
        }
        else if (datastr.indexOf("extends UIToast") >= 0) {
            return "UIToast";
        }
        else {
            console.log(`${controlName}, 没有继承UIBase`);
            return "";
        }
    },
    async walkDirSync(dir, callback) {
        let items = fs.readdirSync(dir);
        for (let i = 0; i < items.length; i++) {
            let name = items[i];
            let filePath = path.join(dir, name);
            let stat = fs.statSync(filePath);
            if (stat.isFile()) {
                let extName = path.extname(filePath);
                if (this.checkIsPrefab(extName)) {
                    await callback(filePath, stat);
                }
                else {
                    if (extName != '.meta')
                        console.log(`提示: 跳过${filePath}, 因为它不是prefab~`);
                }
            }
            else if (stat.isDirectory()) {
                await this.walkDirSync(filePath, callback);
            }
        }
        return null;
    },
    checkIsPrefab(extName) {
        return extName == '.prefab';
    }
};
