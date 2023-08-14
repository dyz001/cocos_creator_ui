import CocosHelper from "../../UIFrame/CocosHelper";
import { CommonUtils } from "../Utils/CommonUtils";
import * as cc from "cc";
const {ccclass, property} = cc._decorator;

@ccclass
export default class CameraCapture extends cc.Component {

    static inst: CameraCapture = null;

    @property(cc.Node)
    captureNode: cc.Node = null;

    private camera: cc.Camera = null;
    onLoad () {
        CameraCapture.inst = this;
        this.camera = this.getComponent(cc.Camera);
        if(!this.camera) {
            this.camera = this.addComponent(cc.Camera);
        }
        this.node.active = false;

    }

    start () {}

    captureTexture() {
        this.node.active = true;
        this.captureNode.active = false;
        let pos = this.captureNode.worldPosition;
        let size = new cc.Vec2(this.captureNode._uiProps.uiTransformComp.contentSize.width * this.captureNode.worldScale.x, this.captureNode._uiProps.uiTransformComp.contentSize.height * this.captureNode.worldScale.y)
        let data = CocosHelper.captureScreen(this.camera, new cc.Rect(pos.x, pos.y, size.x, size.y));
        this.captureNode.active = true;
        this.node.active = false;
        
        return data;
    }


}
