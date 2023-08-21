import * as cc from "cc";
import { UIAuto } from "../UIFrame/UIAuto";
const {ccclass, property} = cc._decorator;
@ccclass
export default class UIPopup_Auto extends UIAuto {
	@property(cc.Label)
	lbl_name: cc.Label = null;
	@property(cc.Sprite)
	spt_bg: cc.Sprite = null;
 
}