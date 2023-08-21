"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = void 0;
const cc = __importStar(require("cc"));
const _localSaveFunc = {};
var PropEmum;
(function (PropEmum) {
    PropEmum[PropEmum["All"] = 0] = "All";
    PropEmum[PropEmum["Active"] = 1] = "Active";
    PropEmum[PropEmum["Position"] = 2] = "Position";
    PropEmum[PropEmum["Rotation"] = 3] = "Rotation";
    PropEmum[PropEmum["Scale"] = 4] = "Scale";
    PropEmum[PropEmum["Anchor"] = 5] = "Anchor";
    PropEmum[PropEmum["Size"] = 6] = "Size";
    PropEmum[PropEmum["Opacity"] = 7] = "Opacity";
    PropEmum[PropEmum["Label_String"] = 8] = "Label_String";
    PropEmum[PropEmum["Sprite_Texture"] = 9] = "Sprite_Texture";
})(PropEmum || (PropEmum = {}));
var NodePathType;
(function (NodePathType) {
    NodePathType[NodePathType["Name"] = 0] = "Name";
    NodePathType[NodePathType["SiblingIndex"] = 1] = "SiblingIndex";
})(NodePathType || (NodePathType = {}));
exports.methods = {
    async start() {
        let childs = cc.director.getScene().children;
        if (childs.length < 3)
            return null;
        let NodeRoot = childs[0].children[1];
        // 获取所有的controller
        let comPropCtrls = NodeRoot.getComponentsInChildren("PropController");
        for (const comPropCtrl of comPropCtrls) {
            if (!comPropCtrl.open) {
                continue;
            }
            let saveData = {};
            if (!comPropCtrl.uid || comPropCtrl.uid.length <= 0) {
                cc.warn(`PropController, pls set node: ${comPropCtrl.node.name}  uid `);
                return;
            }
            if (comPropCtrl.state < 0 || comPropCtrl.state >= comPropCtrl.states.length) {
                cc.warn(`PropController, ${comPropCtrl.uid} 控制器越界了`);
                return;
            }
            if (comPropCtrl.propertyJson) {
                saveData = JSON.parse(comPropCtrl.propertyJson);
            }
            // 把当前状态的数据置空, 重新保存
            saveData[comPropCtrl.state] = {};
            // 删除已经不存在的状态
            for (const e in saveData) {
                if (+e >= comPropCtrl.states.length) { // 表示这个状态已经废弃了
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
    async _doSetProp(comPropCtrl, saveData) {
        let nodeRoot = comPropCtrl.node;
        let pathType = comPropCtrl.nodePathType;
        let map = saveData[comPropCtrl.state];
        if (!map) {
            map = saveData[comPropCtrl.state] = {};
        }
        await walkNodes(nodeRoot, pathType, async (selector, path) => {
            var _a;
            let obj = map[path] = (_a = map[path]) !== null && _a !== void 0 ? _a : {};
            // 如果没有选择, 则全部记录
            if (selector.props.length <= 0) {
                for (let key in _localSaveFunc) {
                    let func = _localSaveFunc[key];
                    obj[key] = await func(selector.node);
                }
                return;
            }
            for (const key of selector.props) {
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
};
function _saveAll(node) {
    var _a, _b, _c;
    let coms = node.getComponents(cc.Component);
    let props = {};
    props["node"] = {
        active: node.active,
        position: node.position,
        angle: node.angle,
        scale: {
            scaleX: node.scale.x,
            scaleY: node.scale.y,
        },
        anchor: {
            anchorX: (_a = node._uiProps.uiTransformComp) === null || _a === void 0 ? void 0 : _a.anchorX,
            anchorY: (_b = node._uiProps.uiTransformComp) === null || _b === void 0 ? void 0 : _b.anchorX,
        },
        size: (_c = node._uiProps.uiTransformComp) === null || _c === void 0 ? void 0 : _c.contentSize,
        opacity: node._uiProps.localOpacity
    };
    let comsProp = props["coms"] = {};
    for (const com of coms) {
        if (com.name.includes("PropSelector"))
            continue;
        let prop = comsProp[com.constructor.name] = {};
        for (let key in com) {
            if (key.startsWith("_"))
                continue;
            let val = com[key];
            if (typeof val === "function" || typeof val === "object")
                continue;
            prop[key] = val;
        }
    }
    return props;
}
function _saveActive(node) {
    return node.active;
}
function _saveLabelString(node) {
    if (!node.getComponent(cc.Label))
        return;
    return node.getComponent(cc.Label).string;
}
async function _saveSpriteTexture(node) {
    if (!node.getComponent(cc.Sprite))
        return;
    // let uuid = (node.getComponent(cc.Sprite).spriteFrame?.getTexture() as any)["_uuid"];
    let uuid = node.getComponent(cc.Sprite).spriteFrame["_uuid"];
    if (!uuid) {
        cc.error("cant find uuid of sprite:" + node.name + ", " + node.getPathInHierarchy());
        return "";
    }
    let sprite = node.getComponent(cc.Sprite);
    let r = sprite === null || sprite === void 0 ? void 0 : sprite.color.r;
    let g = sprite === null || sprite === void 0 ? void 0 : sprite.color.g;
    let b = sprite === null || sprite === void 0 ? void 0 : sprite.color.b;
    let a = sprite === null || sprite === void 0 ? void 0 : sprite.color.a;
    let grayscale = sprite === null || sprite === void 0 ? void 0 : sprite.grayscale;
    let sizemode = sprite === null || sprite === void 0 ? void 0 : sprite.sizeMode;
    let type = sprite === null || sprite === void 0 ? void 0 : sprite.type;
    return Editor.Message.request("asset-db", "query-url", uuid).then(v => {
        let url = v;
        if (!url) {
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
async function walkNodes(root, pathType, callback, path) {
    for (const node of root.children) {
        let selector = node.getComponent("PropSelector");
        if (selector) {
            await callback(selector, _makePath(pathType, path, node));
        }
        if (node.getComponent("PropController"))
            continue;
        if (node.children.length > 0) {
            await walkNodes(node, pathType, callback, _makePath(pathType, path, node));
        }
    }
}
function _makePath(pathType, path, node) {
    switch (pathType) {
        case NodePathType.Name:
            path += `/${node.name}`;
            break;
        case NodePathType.SiblingIndex:
            path += `/${node.getSiblingIndex()}`;
            break;
    }
    return path;
}
function _savePosition(node) {
    return node.position;
}
function _saveScale(node) {
    return {
        scaleX: node.scale.x,
        scaleY: node.scale.y,
        scaleZ: node.scale.z
    };
}
function _saveRotation(node) {
    return node.angle;
}
function _saveOpacity(node) {
    return node._uiProps.opacity;
}
function _saveSize(node) {
    var _a;
    return (_a = node._uiProps.uiTransformComp) === null || _a === void 0 ? void 0 : _a.contentSize;
}
function _saveAnchor(node) {
    var _a, _b;
    return {
        anchorX: (_a = node._uiProps.uiTransformComp) === null || _a === void 0 ? void 0 : _a.anchorX,
        anchorY: (_b = node._uiProps.uiTransformComp) === null || _b === void 0 ? void 0 : _b.anchorY
    };
}
function _regiestSaveFunction(propId, func) {
    if (_localSaveFunc[propId]) {
        cc.warn(`prop: ${propId}, 已经被注册了, 此次注册将会覆盖上次的func`);
        return;
    }
    _localSaveFunc[propId] = func;
}
