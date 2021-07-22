import { NormalizedLandmarkList } from '@mediapipe/hands';
import { BehaviorSubject, Observable } from 'rxjs';
import * as THREE from 'three';

export class Depth {
    private _stdLandmarks: NormalizedLandmarkList = [];
    private _prjLandmarks: NormalizedLandmarkList = [];
    private _stdFL: number[] = [];
    private _depth: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    private _needUpdateStdFL = false;
    
    /**
     * 取得depth 的 Observable物件，訂閱此Observable以獲得深度
     */
    get depthOb(): Observable<number>{
        return this._depth.asObservable();
    }

    /**
     * 取得目前的手指深度(目前是食指)
     */
    get depth(): number {
        return this._depth.getValue();
    }

    /**
     * 更新目前得手指位置，並非同步計算手指深度
     * @param landmarks 
     */
    public updateLandmarks(landmarks: NormalizedLandmarkList): void{
        if(this._needUpdateStdFL) {
            this.logStd(landmarks);
        }
        // update
        this._prjLandmarks = this.firstFingerOf(landmarks);
        // compute
        this.computeDepth();
    }

    /**
     * 輸入目前的手指位置，得到估計的手指深度(食指)，同時非同步發布深度
     * @param landmarks 手指位置，若為空則預設為先前保存的值
     * @returns 手指深度(目前是食指)
     */
    public async computeDepth(landmarks: NormalizedLandmarkList = []): Promise<number> {
        if(this._stdLandmarks.length < 1) {
            return 0;
        }
        if(landmarks.length < 1) {
            if(this._prjLandmarks.length < 1){ return 0; }
            landmarks = this._prjLandmarks;
        }else {
            landmarks = this.firstFingerOf(landmarks);
        }

        // compute  /////////////////////
        let FL: number[] = this.lengthsBetweenLandmarks(landmarks);
        // console.log("FL: ", FL);

        let rads = [];
        for(let idx in this._stdFL){
            rads.push(Math.acos(FL[idx] / this._stdFL[idx]));
        }
        // console.log('rads: ', rads);

        // reduce
        const depth = rads.reduce((depthAcc, rad, idx) => {
            if(idx !== 0){
                return this._stdFL[idx] * Math.sin(rad) + depthAcc;
            }
            return 0;
        }, 0);

        // update depth by subject.next()
        this._depth.next(depth);
        return depth;
    }

    /**
     * 準備在下一次 updateLandmarks時更新目前的標準手指位置(目前是用食指)，
     * 或是直接傳入 landmarks來更新 stdLandmarks
     * @param landmarks 目前的手指位置
     */
    public logStd(landmarks: NormalizedLandmarkList = []): void {
        if(landmarks.length < 1){
            this._needUpdateStdFL = true;
            return ;
        }
        this._needUpdateStdFL = false;
        this._stdLandmarks = this.firstFingerOf(landmarks);
        this._stdFL = this.lengthsBetweenLandmarks(this._stdLandmarks);
        // _stdFL
        console.log('%c standard logged!!', "color: blue");
    }

    /**
     * 將關節點位置轉換為關節之間的距離陣列(5個點換成4格距離)
     * @param landmarks 關節點位置
     * @returns 相鄰關節之間的距離
     */
    public lengthsBetweenLandmarks(landmarks: NormalizedLandmarkList): number[] {
        let out: number[] = [];
        let previous: THREE.Vector2 = new THREE.Vector2(landmarks[0].x, landmarks[0].y);
        landmarks.map((v, i) => {
            if(i != 0) {
                const current = new THREE.Vector2(v.x, v.y);
                out.push(current.distanceTo(previous));
                previous = current;
            }
        });
        return out;
    }

    /**
     * 擷取出食指的landmarks(編號0 5 6 7 8)
     * @param landmarks 整隻手的landmarks
     * @returns 食指的landmarks
     */
    public firstFingerOf(landmarks: NormalizedLandmarkList): NormalizedLandmarkList {
        let firstFinger: NormalizedLandmarkList = [];
        landmarks.map((lm, idx) => {
            if([0, 5, 6, 7, 8].indexOf(idx) !== -1) {
                firstFinger.push(lm);
            }
        });
        return firstFinger;
    }

    constructor() { }
}