import * as cc from "cc";
import { UIAuto } from "../UIFrame/UIAuto";
const {ccclass, property} = cc._decorator;
@ccclass
export default class UIMain_Auto extends UIAuto {
	@property(cc.Node)
	bg: cc.Node = null;
	@property(cc.Button)
	btn_home: cc.Button = null;
	@property(cc.Button)
	btn_healthy: cc.Button = null;
	@property(cc.Button)
	btn_dynamic: cc.Button = null;
	@property(cc.Button)
	btn_my: cc.Button = null;
	@property(cc.Button)
	btn_task: cc.Button = null;
 
}