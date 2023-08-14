import * as cc from "cc";
import { FormType } from './config/SysDefine';
import { CCString } from "cc";
const { ccclass, property } = cc._decorator;

@ccclass('UIAuto')
export class UIAuto extends cc.Component {
    public fid: string = '';
    public formType: FormType | null = null;
    @property(CCString)
    public controlName: string = "UIBase";
    start() {

    }

    update(deltaTime: number) {
        
    }
}

//@ts-ignore
cc.UIAuto = UIAuto;


