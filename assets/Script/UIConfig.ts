import * as cc from "cc";
import { EDITOR } from "cc/env";
import {UIMain} from "./Controls/UIMain";
import {UISimpleToast} from "./Controls/UISimpleToast";

export default class UIConfig {
    static UIMain = {
                prefabUrl: "Forms/UIMain",
                type: "UIScreen",
                control: UIMain
            };
            static UISimpleToast = {
                prefabUrl: "Forms/UISimpleToast",
                type: "UIToast",
                control: UISimpleToast
            };
            
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
