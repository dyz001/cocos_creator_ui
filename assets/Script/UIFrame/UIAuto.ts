import * as cc from "cc";
import { FormType } from './config/SysDefine';
import { CCString } from "cc";
const { ccclass, property } = cc._decorator;

@ccclass('UIAuto')
export class UIAuto extends cc.Component {
    public fid: string = '';
    @property({type: cc.Enum(FormType),displayName:"formType"})
    public formType: FormType = FormType.Screen;
    @property(CCString)
    public controlName: string = "UIBase";
    start() {

    }

    update(deltaTime: number) {
        
    }
}

//@ts-ignore
cc.UIAuto = UIAuto;


