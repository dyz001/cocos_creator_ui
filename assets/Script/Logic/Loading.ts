import { Camera, Canvas, Color, Event, Graphics, GraphicsComponent, Label, Layers, Node, UITransform, director, error, find, log, macro, view } from "cc";

export class Loading{
    protected bg: Graphics;
    protected bar: Graphics;
    protected fore: Graphics;
    protected lbl_process: Label;
    protected bg_color: Color;
    protected bar_color: Color;
    protected fore_color: Color;

    protected font_size: number;
    protected font_color: Color;

    protected cur_count: number;
    protected total_count: number;

    protected bar_gap: number;
    protected bar_height: number;
    protected updateCallback: Function;
    protected cur_item: any;

    protected node: Node;

    protected static ins: Loading;

    protected constructor(){
        this.bg_color = Color.GRAY;
        this.bar_color = Color.RED;
        this.fore_color = Color.GREEN;
        this.font_size = 20;
        this.font_color = Color.WHITE;
        this.bar_gap = 50;
        this.bar_height = 10;
        this.cur_count = this.total_count = 0;
    }

    public static getInstance(){
        if(!this.ins){
            this.ins = new Loading();
        }
        return this.ins;
    }

    public updateProcess(cur: number, total: number, curItem?: any){
        this.cur_count = cur;
        this.total_count = total;
        this.cur_item = curItem;
        if(!this.isShowing()){
            this.show();
        }
    }

    public show(){
        if(this.isShowing()) return;
        if(!this.node){
            if(!this.initUI()){
                error("can not add Graphics");
                return;
            }
        }
        director.getScene().getChildByName("Canvas").addChild(this.node);
        this.bg.schedule(this.updateCallback, 0.1, macro.REPEAT_FOREVER);
    }

    public isShowing(){
        return this.node.parent != null;
    }

    public hide(){
        log("on hide");
        this.bg.unschedule(this.updateCallback);
        this.node.removeFromParent();
    }

    protected initUI(){
        if(this.node) return this.node;
        this.node = new Node("loading");
        this.node.layer = Layers.Enum.UI_2D;
        let viewSize = view.getVisibleSize();
        let trans = this.node.addComponent(UITransform);
        trans.setContentSize(viewSize);
        try{
            this.bg = this.node.addComponent(Graphics);
        }
        catch(ex){
            error(ex);
        }
        if(!this.bg){
            return false;
        }
        let node = new Node("lbl_process");
        this.lbl_process = node.addComponent(Label);
        this.lbl_process.fontSize = this.font_size;
        this.lbl_process.color = this.font_color;
        node._uiProps.uiTransformComp.height = this.font_size;
        this.node.addChild(node);
        this.lbl_process.string = this.getDisplayText();
        this.updateCallback = this.update.bind(this);
        return true;
    }

    protected getDisplayText(){
        if(!this.total_count) return "0%";
        return Math.floor((this.cur_count / this.total_count) * 100) + "%";
    }

    protected drawBg(){
        this.bg.fillColor = this.bg_color;
        let viewSize = view.getVisibleSize();
        this.bg.rect(-viewSize.width / 2, -viewSize.height / 2, viewSize.width, viewSize.height);
        this.bg.fill();
    }

    protected drawProcess(){
        this.bg.fillColor = this.bar_color;
        let viewSize = view.getVisibleSize();
        let total_width = viewSize.width - this.bar_gap * 2;
        let y = this.font_size / 2;
        this.bg.strokeColor = Color.TRANSPARENT;
        this.bg.roundRect(-viewSize.width / 2 + this.bar_gap, y, total_width, this.bar_height, this.bar_height / 2);
        this.bg.fill();

        this.bg.fillColor = this.fore_color;
        let width = (viewSize.width - this.bar_gap * 2) * (this.cur_count / this.total_count);
        let r = this.bar_height / 2;
        let x_begin = -viewSize.width / 2 + this.bar_gap;
        let y_begin = y;
        let arc_x = x_begin + r;
        let arc_y = y_begin + r;
        this.bg.strokeColor = Color.TRANSPARENT;
        if(width < r){
            let cos = (r - width) / r;
            this.bg.arc(arc_x, arc_y, r, Math.PI - Math.acos(cos), Math.PI + Math.acos(cos), true);
            this.bg.close();
            this.bg.fill();
        }
        else if(width >= r && width < total_width - this.bar_height / 2){
            this.bg.arc(arc_x, arc_y, r, Math.PI / 2, Math.PI * 1.5, true);
            this.bg.lineTo(arc_x - r + width, y_begin);
            this.bg.lineTo(arc_x - r + width, y_begin + this.bar_height);
            this.bg.close();
            this.bg.fill();
        }
        else{
            this.bg.strokeColor = Color.TRANSPARENT;
            this.bg.roundRect(-viewSize.width / 2 + this.bar_gap, y, total_width, this.bar_height, this.bar_height / 2);
            this.bg.fill();
            this.bg.strokeColor = Color.TRANSPARENT;
            let delta = width + r - total_width;
            this.bg.fillColor = this.bar_color;
            this.bg.arc(width + x_begin - delta, arc_y, r, -Math.acos(delta / r), Math.acos(delta / r), true);
            this.bg.close();
            this.bg.fill();
        }

        this.lbl_process.string = this.getDisplayText();
    }

    public update(){
        if(!this.bg){
            error(this.node.name);
            error(this);
            return;
        }
        if(this.total_count == 0) return;
        this.bg.clear();
        this.drawBg();
        this.drawProcess();
        if(this.cur_count != 0 && this.cur_count >= this.total_count){
            this.hide();
        }
    }
}