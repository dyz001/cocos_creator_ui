import UISimpleToast_Auto from '../AutoScripts/UISimpleToast_Auto';
import { UIToast } from '../UIFrame/UIForm';
import {Animation} from "cc";
export class UISimpleToast extends UIToast{
    protected animation: Animation;
    public onInit(params: any) {
        this.animation = this.view.getComponent(Animation);
    }
    public onShow(params: any) {
        (this.view as UISimpleToast_Auto).lbl_cont.string = params;
    }
    public async showEffect() {
        this.animation.play("toast_show");
    }
    public async hideEffect() {
        this.animation.play("toast_hide");
    }
}