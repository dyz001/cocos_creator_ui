import * as cc from "cc";
import { IPool } from "../Common/Utils/Pool";
import CocosHelper from "./CocosHelper";
import { FormType, ModalOpacity } from "./config/SysDefine";
import FormMgr from "./FormMgr";
import { ECloseType, ModalType } from "./Struct";
import UIBase from "./UIBase";
import { Vec3 } from "cc";


export class UIScreen extends UIBase {
    formType = FormType.Screen;
    closeType = ECloseType.CloseAndDestory;
}

export class UIWindow extends UIBase {
    formType = FormType.Window;    
    modalType = new ModalType(ModalOpacity.OpacityFull);                // 阴影类型
    closeType = ECloseType.LRU;

    /** 显示效果 */
    public async showEffect() {
        cc.tween(this.node).set({scale: new Vec3(0, 0, 1)}).to(0.3, {scale: new Vec3(1, 1, 1)}).start();
    }
}

export class UIFixed extends UIBase {
    formType = FormType.Fixed;
    closeType = ECloseType.LRU;
}

export class UITips extends UIBase {
    formType = FormType.Tips;
    closeType = ECloseType.CloseAndHide;
}

export class UIToast extends UIBase implements IPool {
    formType = FormType.Toast;

    public use() {
        
    }

    public free() {

    }

    public async closeSelf(): Promise<boolean> {
        return await FormMgr.close({prefabUrl: this.fid, type: this.formType});
    }
}


// @ts-ignore
cc.UIScreen = UIScreen;
// @ts-ignore
cc.UIWindow = UIWindow;
// @ts-ignore
cc.UIFixed = UIFixed;
// @ts-ignore
cc.UITips = UITips;
// @ts-ignore
cc.UIToast = UIToast;
