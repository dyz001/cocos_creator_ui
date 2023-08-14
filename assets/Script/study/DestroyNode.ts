import { _decorator, Component, Node,log } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DestroyNode')
export class DestroyNode extends Component {
    protected lastUpdate: number;
    start() {
        this.lastUpdate = Date.now();
        this.scheduleOnce(()=>{
            this.node.destroy();
        }, 5000);
    }

    update(deltaTime: number) {
        if(!this.lastUpdate) return;
        if(Date.now() - this.lastUpdate > 1000){
            log("update in destroy node");
            this.lastUpdate = Date.now();
        }
    }
}


