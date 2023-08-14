import * as cc from "cc";

import CocosHelper from "./CocosHelper";
import { SysDefine } from "./config/SysDefine";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SoundMgr extends cc.Component {

    private audioCache: {[key: string]: cc.AudioClip} = cc.js.createMap();

    private static _inst: SoundMgr | null = null;                     // 单例
    protected sound: cc.AudioSource;
    public static get inst(): SoundMgr | null {
        if(this._inst == null) {
            let root = cc.find(SysDefine.SYS_UIROOT_NAME);
            if(!root) return null;
            this._inst = root.addComponent<SoundMgr>(this);
            this._inst.sound = root.addComponent(cc.AudioSource);
            this._inst.sound.loop = true;
        }
        return this._inst;
    }

    private currEffectId: number = -1;
    private currMusicId: number = -1;

    onLoad () {
        let volume = this.getVolumeToLocal();
        if(volume) {
            this.volume = volume;
        }else {
            this.volume.musicVolume = 1;
            this.volume.effectVolume = 1;
        }
        this.setVolumeToLocal();

        cc.game.on(cc.Game.EVENT_HIDE, () => {
            this.sound.stop();
            //cc.audioEngine.pauseAll();
        }, this);
        cc.game.on(cc.Game.EVENT_SHOW, () => {
            if(!this.sound.clip) return;
            this.sound.volume = this.volume.musicVolume;
            this.sound.play();
        }, this);
    }
    /** volume */
    private volume: Volume = new Volume();
    getVolume() {
        return this.volume;
    }

    start () {

    }
    /**  */
    public setMusicVolume(musicVolume: number) {
        this.volume.musicVolume = musicVolume;
        this.setVolumeToLocal();
    }
    public setEffectVolume(effectVolume: number) {
        this.volume.effectVolume = effectVolume;
        this.setVolumeToLocal();
    }
    /** 播放背景音乐 */
    public async playMusic(url: string, loop = true) {
        if(!url || url === '') return ;
        
        if(this.audioCache[url]) {
            this.sound.clip = this.audioCache[url];
            this.sound.play();
            return ;
        }
        let sound = await CocosHelper.loadResSync<cc.AudioClip>(url, cc.AudioClip);
        if(sound) this.audioCache[url] = sound;
        this.sound.clip = sound;
        this.sound.play();
        //this.currMusicId = cc.audioEngine.playMusic(sound, loop);
    }
    /** 播放音效 */
    public async playEffect(url: string, loop = false) {
        if(!url || url === '') return ;
        
        if(this.audioCache[url]) {
            this.sound.playOneShot(this.audioCache[url], this.volume.effectVolume);
            return ;
        }
        let sound = await CocosHelper.loadResSync<cc.AudioClip>(url, cc.AudioClip);
        if(sound) this.audioCache[url] = sound;
        this.sound.playOneShot(sound, this.volume.effectVolume);
    }

    /** 从本地读取 */
    private getVolumeToLocal() {
        let objStr = cc.sys.localStorage.getItem("Volume_For_Creator");
        if(!objStr) {
            return null;
        }
        return JSON.parse(objStr);
    }
    /** 设置音量 */
    private setVolumeToLocal() {
        // cc.audioEngine.setMusicVolume(this.volume.musicVolume);
        // cc.audioEngine.setEffectsVolume(this.volume.effectVolume);

        cc.sys.localStorage.setItem("Volume_For_Creator", JSON.stringify(this.volume));
    }

    public setEffectActive(active: boolean, id: number = -1) {
        if(active) {
            //cc.audioEngine.stop(id < 0 ? this.currEffectId : id);
        }else {
            //cc.audioEngine.resume(id < 0 ? this.currEffectId : id); 
        }
    }

    // update (dt) {}
}

class Volume {
    musicVolume: number = 0;
    effectVolume: number = 0;
}