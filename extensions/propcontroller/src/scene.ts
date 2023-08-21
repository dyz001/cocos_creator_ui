import * as cc from "cc";
const _localSaveFunc: {[key: number]: (node: cc.Node) => any} = {};
enum PropEmum {
    All,
    Active,
    Position,
    Rotation,
    Scale,
    Anchor,
    Size,
    Opacity,
    Label_String,
    Sprite_Texture,
}
enum NodePathType {
    Name,
    SiblingIndex,
}
export const methods = {
    async start(){
        let childs = cc.director.getScene()!.children;
        if(childs.length < 3) return null;
        let NodeRoot = childs[0].children[1];
        // 获取所有的controller
        let comPropCtrls = <any>NodeRoot.getComponentsInChildren("PropController");
        
        for(const comPropCtrl of comPropCtrls) {
            if(!comPropCtrl.open) {            
                continue;
            }
    
            let saveData: {[key: string]: any} = {};
            
            if(!comPropCtrl.uid || comPropCtrl.uid.length <= 0) {
                cc.warn(`PropController, pls set node: ${comPropCtrl.node.name}  uid `);
                return ;
            }
    
            if(comPropCtrl.state < 0 || comPropCtrl.state >= comPropCtrl.states.length) {
                cc.warn(`PropController, ${comPropCtrl.uid} 控制器越界了`);
                return ;
            }
    
            if(comPropCtrl.propertyJson) {
                saveData = JSON.parse(comPropCtrl.propertyJson);
            }
            // 把当前状态的数据置空, 重新保存
            saveData[comPropCtrl.state] = {};
            // 删除已经不存在的状态
            for(const e in saveData) {
                if(+e >= comPropCtrl.states.length) {  // 表示这个状态已经废弃了
                    saveData[e] = null;
                    delete saveData[e];
                }
            }
    
            // 把当前控制器下的
            this._doSetProp(comPropCtrl, saveData).then(() => {
                comPropCtrl.propertyJson = JSON.stringify(saveData);
                cc.log('控制器数据保存成功');
            });
        }
    },
    
    async _doSetProp(comPropCtrl: any, saveData: any) {

        let nodeRoot = <cc.Node>comPropCtrl.node;
        let pathType = comPropCtrl.nodePathType;

        let map = saveData[comPropCtrl.state];
        if(!map) {
            map = saveData[comPropCtrl.state] = {};
        }
        await walkNodes(nodeRoot, pathType, async (selector: any, path: string) => {
            
            let obj = map[path] = map[path] ?? {};

            // 如果没有选择, 则全部记录
            if(selector.props.length <= 0) {
                for(let key in _localSaveFunc) {
                    let func = _localSaveFunc[key];
                    obj[key] = await func(selector.node);
                }
                return;
            }

            for(const key of selector.props) {
                let func = _localSaveFunc[key];
                obj[key] = await func(selector.node);
                
            }
        }, `${pathType}:`);
    
    },
    load() {
        console.log("onload scene");
        _regiestSaveFunction(PropEmum.All, _saveAll);
        _regiestSaveFunction(PropEmum.Active, _saveActive);
        _regiestSaveFunction(PropEmum.Position, _savePosition);
        // _regiestSaveFunction(PropEmum.Color, _saveColor);
        _regiestSaveFunction(PropEmum.Scale, _saveScale);
        _regiestSaveFunction(PropEmum.Rotation, _saveRotation);
        _regiestSaveFunction(PropEmum.Opacity, _saveOpacity);
        // _regiestSaveFunction(PropEmum.Slew, _saveSkew);
        _regiestSaveFunction(PropEmum.Size, _saveSize);
        _regiestSaveFunction(PropEmum.Anchor, _saveAnchor);
        _regiestSaveFunction(PropEmum.Label_String, _saveLabelString);
        _regiestSaveFunction(PropEmum.Sprite_Texture, _saveSpriteTexture);
     }
}

function _saveAll(node: cc.Node) {
    let coms = node.getComponents(cc.Component);
    let props = {} as any;
    props["node"] = {
        active: node.active,
        position: node.position,
        angle: node.angle,
        scale: {
            scaleX: node.scale.x,
            scaleY: node.scale.y,
        },
        anchor: {
            anchorX: node._uiProps.uiTransformComp?.anchorX,
            anchorY: node._uiProps.uiTransformComp?.anchorX,
        },
        size: node._uiProps.uiTransformComp?.contentSize,
        opacity: node._uiProps.localOpacity
    }
    let comsProp = props["coms"] = {} as any;
    for(const com of coms) {
        if(com.name.includes("PropSelector")) continue;
        let prop = comsProp[com.constructor.name] = {} as any; 
        for(let key in com) {
            if(key.startsWith("_")) continue;
            let val = (com as any)[key];
            if(typeof val === "function" || typeof val === "object") continue;
            prop[key] = val;
        }
    }
    return props;
}

function _saveActive(node: cc.Node) {
    return node.active;
}
function _saveLabelString(node: cc.Node) {
    if(!node.getComponent(cc.Label)) return ;
    return node.getComponent(cc.Label)!.string;
}

async function _saveSpriteTexture(node: cc.Node) {
    if(!node.getComponent(cc.Sprite)) return ;
    // let uuid = (node.getComponent(cc.Sprite).spriteFrame?.getTexture() as any)["_uuid"];
    let uuid = (node.getComponent(cc.Sprite)!.spriteFrame as any)["_uuid"];
    if(!uuid){
        cc.error("cant find uuid of sprite:" + node.name + ", " + node.getPathInHierarchy());
        return "";
    }
    let sprite = node.getComponent(cc.Sprite);
    let r = sprite?.color.r;
    let g = sprite?.color.g;
    let b = sprite?.color.b;
    let a = sprite?.color.a;
    let grayscale = sprite?.grayscale;
    let sizemode = sprite?.sizeMode;
    let type = sprite?.type;
    return Editor.Message.request("asset-db", "query-url", uuid).then(v=>{
        let url = v;
        if(!url){
            cc.error("not found uuid:" + uuid);
            return;
        }
        return {
            uuid,
            url,
            r,
            g,
            b,
            a,
            grayscale,
            sizemode,
            type
        };
    });
}

async function walkNodes(root: cc.Node, pathType: number, callback: Function, path: string) {

    for(const node of root.children) {
        let selector = node.getComponent("PropSelector");
        if(selector) {
            await callback(selector, _makePath(pathType, path, node));
        }
        
        if(node.getComponent("PropController")) continue;

        if(node.children.length > 0) {
            await walkNodes(node, pathType, callback, _makePath(pathType, path, node));
        }
    }
}

function _makePath(pathType: number, path: string, node: cc.Node) {
    switch(pathType) {
        case NodePathType.Name:
            path += `/${node.name}`;
        break;
        case NodePathType.SiblingIndex:
            path += `/${node.getSiblingIndex()}`;
        break;
    }
    return path;
}

function _savePosition(node: cc.Node) {
    return node.position;
}

function _saveScale(node: cc.Node) {
    return {
        scaleX: node.scale.x,
        scaleY: node.scale.y,
        scaleZ: node.scale.z
    }
}

function _saveRotation(node: cc.Node) {
    return node.angle;
}

function _saveOpacity(node: cc.Node) {
    return node._uiProps.opacity;
}

function _saveSize(node: cc.Node) {
    return node._uiProps.uiTransformComp?.contentSize;
}

function _saveAnchor(node: cc.Node) {
    return {
        anchorX: node._uiProps.uiTransformComp?.anchorX,
        anchorY: node._uiProps.uiTransformComp?.anchorY
    };
}

function _regiestSaveFunction(propId: number, func: (node: cc.Node) => any) {
    if(_localSaveFunc[propId]) {
        cc.warn(`prop: ${propId}, 已经被注册了, 此次注册将会覆盖上次的func`);
        return ;
    }
    _localSaveFunc[propId] = func;
}

