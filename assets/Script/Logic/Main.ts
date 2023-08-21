import { _decorator, Component, Node } from 'cc';
import { UIMain } from '../Controls/UIMain';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    start() {
        UIMain.open();
    }

    update(deltaTime: number) {
        
    }
}


