import * as cc from "cc";
import { UIAuto } from "../UIFrame/UIAuto";
const {ccclass, property} = cc._decorator;
@ccclass
export default class UISimpleToast_Auto extends UIAuto {
	@property(cc.Label)
	lbl_cont: cc.Label = null;
 
}