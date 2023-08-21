import { _decorator, Component, director, EventTouch, game, Input, log, Node, Touch } from 'cc';
import { Loading } from '../Logic/Loading';
const { ccclass, property } = _decorator;

@ccclass('TestLoading')
export class TestLoading extends Component {
    protected cur_count: number;
    protected total_count: number;
    protected update_time: number;
    public last_update: number;
    public stop: boolean;

    start() {
        this.cur_count = 0;
        this.total_count = 100;
        this.update_time = 10;
        this.stop = false;
        this.last_update = new Date().getTime();
        Loading.getInstance().updateProcess(this.cur_count, this.total_count);
    }

    update(deltaTime: number) {
        if(this.stop) return;
        if(!this.last_update) return;
        if(new Date().getTime() - this.last_update > this.update_time){
            this.last_update = new Date().getTime();
            this.cur_count+=0.05;
            Loading.getInstance().updateProcess(this.cur_count, this.total_count);
        }
    }
}


