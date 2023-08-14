import { ScrollViewHelper, ScrollViewElementProxy } from "../../Common/Components/ScrollViewHelper";
import * as cc from "cc";
const {ccclass, property} = cc._decorator;

enum RowDirection {
    LeftToRight,
    TopToBottom
}

@ccclass
export class GridScrollList extends cc.Component {
    public allProxy : ScrollViewElementProxy[] = [];
    @property(ScrollViewHelper)
    public scrollHelper:ScrollViewHelper = null;
    @property({type:cc.Enum(RowDirection)})
    private rowDirection:RowDirection = RowDirection.LeftToRight;
    @property(cc.CCInteger)
    private colSpace : number = 10;
    @property(cc.CCInteger)
    private rowSpace : number = 10;
    @property(cc.CCInteger)
    private colCount : number = 3;
    @property(cc.CCInteger)
    private margin : number = 10;

    public doLayout() {
        this._layoutItems();
    }

    private _layoutItems() {
        this.scrollHelper.clearData();
        let data = this.allProxy;
        let elemSize = data.length?data[0].region.size:cc.size(0, 0);
        let xSpace = this.colSpace;
        let ySpace = this.rowSpace;
        let colCount = this.colCount;
        let viewSize = this.scrollHelper.scrollView.node._uiProps.uiTransformComp.contentSize;
        if(this.rowDirection == RowDirection.TopToBottom) {
            let temp = viewSize.width;
            this.scrollHelper.scrollView.node._uiProps.uiTransformComp.setContentSize(viewSize.height, viewSize.width);
            temp = elemSize.width;
            elemSize.width = elemSize.height;
            elemSize.height = temp;
        }
        let yMargin = this.margin;
        let xMargin = (viewSize.width - (colCount * elemSize.width + (colCount - 1) * xSpace)) / 2;
        

        let x = xMargin;
        let y = - yMargin + ySpace + elemSize.height;
        let dy = -ySpace - elemSize.height;
        let dx = xSpace + elemSize.width;
        if(this.rowDirection == RowDirection.TopToBottom) {
            dy = ySpace + elemSize.height;
            dx = -xSpace - elemSize.width;
            y = yMargin - dy;
        }
        for(let i = 0; i < data.length; i++) {
            x += dx;
            if(i % colCount == 0) {
                y += dy;
                x = xMargin;
            }
            let proxy = data[i];
            if(this.rowDirection == RowDirection.LeftToRight) {
                proxy.region.origin = cc.v2(x, y - elemSize.height);
            } else {
                proxy.region.origin = cc.v2(y, x - elemSize.height);
            }
            this.scrollHelper.addData(proxy);
        }
        if(this.rowDirection == RowDirection.LeftToRight) {
            this.scrollHelper.scrollView.content._uiProps.uiTransformComp.setContentSize(viewSize.width, -y + elemSize.height + yMargin);
        } else {
            this.scrollHelper.scrollView.content._uiProps.uiTransformComp.setContentSize(y + elemSize.height + yMargin, viewSize.width);
        }
    }
}