
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
import Const from "./Const";

//@ts-ignore
const fs = require('fs');
//@ts-ignore
const path = require('path');

const ProjectPath = Editor.Project.path;
let map: {[key: string]: any} = {};
export const methods: { [key: string]: (...any: any) => any } = {
    async start() {
        console.log(`正在读取配置文件: ${ProjectPath}/${Const.ConfigUrl} 请稍等.`);
        let config = fs.readFileSync(`${ProjectPath}/${Const.ConfigUrl}`);
        if(!config) {
            console.log(`读取配置文件失败:${ProjectPath}/${Const.ConfigUrl}`);
            return ;
        }
        config = JSON.parse(config);
        let ProjectDir = Editor.Project.path;
        let FormsPath = `${ProjectDir}/${config.FormsDir}`.replace(/\\/g, "/");
        let ConfigPath = `${ProjectDir}/${config.ScriptsDir}/${config.ScriptsName}`.replace(/\\/g, "/");
        await this.walkDirSync(FormsPath, async (prefabUrl: string, stat: any) => {
            let type = await this.getPrefabType(prefabUrl);
            if(!type) return null;
            let baseName = path.basename(prefabUrl).split(".")[0];
            map[baseName] = {
                prefabUrl: this.getResourcesUrl(prefabUrl),
                type: type
            }
            return null;
        });
        let contentStr = ``;
        for(const key in map) {
            contentStr += `static ${key} = {
        prefabUrl: "${map[key].prefabUrl}",
        type: "${map[key].type}"
    }
    `
        }
        let strScript = `
export default class UIConfig {
    ${contentStr}
}
cc.game.on(cc.game.EVENT_GAME_INITED, () => {
    if(CC_EDITOR) return;
    for(const key in UIConfig) { 
        let constourt = cc.js.getClassByName(key);
        if(!constourt) {
            let urls = UIConfig[key].prefabUrl.split('/') as string[];
            if(!urls || urls.length <= 0) continue;
            let name = urls[urls.length - 1];
            constourt = cc.js.getClassByName(name);
        }
        constourt['UIConfig'] = UIConfig[key];
    }
});
`;

        let dbConfigPath = ConfigPath.replace(Editor.Project.path.replace(/\\/g, "/"), "db:/");
        await this.saveFile(dbConfigPath, strScript);
        console.log(`生成${config.ScriptsName}文件成功`);
    },

    saveFile(dbPath: string, strScript: string) {
        return Editor.Message.request("asset-db", "create-asset", dbPath, strScript, {overwrite:true});
    },
    getResourcesUrl(fileUrl: string) {
        let url = `${Editor.Project.path}/assets/resources/`.replace(/\\/g, "/");
        fileUrl = fileUrl.replace(/\\/g, "/");
        console.log(fileUrl, url);
        return fileUrl.replace(url, "").split('.')[0];
    },
    getPrefabType(fileUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let prefab = fs.readFileSync(fileUrl);
            let prefabJson = JSON.parse(prefab);
            let idx = prefabJson.length;
            while (--idx >= 0) {
                let obj = prefabJson[idx];
                let uuidZip = obj.__type__;
                if (uuidZip.indexOf("cc.") == -1) {
                    //@ts-ignore
                    let uuid = Editor.Utils.UuidUtils.decompressUuid(uuidZip);
                    if (Editor.remote.assetdb.assetInfoByUuid(uuid)) {
                        let fsComponentPath = Editor.remote.assetdb.uuidToFspath(uuid);
                        // let dbFileUrls = getResourcesUrl(fsComponentPath).split("/");
                        // let fileName = dbFileUrls[dbFileUrls.length - 1];
                        let fileName = path.basename(fsComponentPath).split(".")[0];
                        if (fileName.indexOf("UI") >= 0 && fileName.indexOf("_Auto") == -1) {//注意 只检测文件名包含UI的文件&排除自动生成的Auto脚本
                            // Editor.warn(`fileName:${fileName}`);
                            let datastr = fs.readFileSync(fsComponentPath);
                            if (datastr.indexOf("extends UIScreen") >= 0) {
                                resolve("UIScreen");
                            } else if (datastr.indexOf("extends UIWindow") >= 0) {
                                resolve("UIWindow");
                            } else if (datastr.indexOf("extends UIFixed") >= 0) {
                                resolve("UIFixed");
                            } else if (datastr.indexOf("extends UITips") >= 0) {
                                resolve("UITips");
                            } else if (datastr.indexOf("extends UIToast") >= 0) {
                                resolve("UIToast");
                            } else {
                                console.log(`${fileUrl}, 没有继承UIBase`);
                                // return "";
                            }
                        }
                    }
                }
            }
            resolve("");
        });
    },
    async walkDirSync(dir: string, callback: (fileUrl: string, stat: any) => Promise<null>) {
        let items = fs.readdirSync(dir);
        for(let i=0; i<items.length; i++) {
            let name = items[i];
            let filePath = path.join(dir, name);
            let stat = fs.statSync(filePath);
            if (stat.isFile()) {
                let extName = path.extname(filePath);
                if(this.checkIsPrefab(extName)){
                    await callback(filePath, stat);
                }else {
                    if(extName != '.meta') console.log(`提示: 跳过${filePath}, 因为它不是prefab~`);
                }
            } else if(stat.isDirectory()) {
                await this.walkDirSync(filePath, callback);
            }
        }
        return null;
    },
    checkIsPrefab(extName: string) {
        return extName == '.prefab';
    }
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() { }

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() { }
