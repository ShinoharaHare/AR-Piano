import { NormalizedLandmarkList, NormalizedLandmarkListList } from '@mediapipe/hands';
import { BehaviorSubject, Observable } from 'rxjs';
import * as THREE from 'three';

export class Depth {
    private _stdLandmarks: NormalizedLandmarkListList = [];
    private _prjLandmarks: NormalizedLandmarkListList = [];
    private _stdFL: number[][] = [];
    private _depth: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([0,0,0,0,0]);
    // public readonly threshold: number[] = [0.09, 0.13, 0.15, 0.14, 0.10];  // [deprecated]
    private _needUpdateStdFL = false;
    public maxDepth: number[] = [0.08, 0.12, 0.14, 0.13, 0.09];
    
    /**
     * 取得depth陣列 的 Observable物件，訂閱此Observable以獲得深度陣列
     */
    get depthOb(): Observable<number[]>{
        return this._depth.asObservable();
    }

    /**
     * 取得目前的手指深度陣列，用 index來指定哪隻手指
     */
    get depth(): number[] {
        return this._depth.getValue();
    }

    /**
     * 獲得經計算的門檻值
     */
    get threshold(): number[] {
        const ratio: number = 0.9;
        return this.maxDepth.map(v => v * ratio);
    }


    /**
     * 更新目前得手指位置，並非同步計算手指深度
     * @param landmarks 整隻手的位置
     */
    public updateLandmarks(landmarks: NormalizedLandmarkList): void{
        if(this._needUpdateStdFL) {
            this.logStd(landmarks);
        }
        // update
        this._prjLandmarks = this.getNthFinger(landmarks) as NormalizedLandmarkListList;
        // compute
        this.computeDepth();
    }

    /**
     * [async]
     * 輸入目前的手指位置，得到估計的手指深度陣列，同時非同步發布深度陣列
     * @param landmarks 手指位置，若為空則預設為先前保存的值 [deprecated]
     * @returns 手指深度陣列
     */
    public async computeDepth(): Promise<number[]> {
        if(this._stdLandmarks.length < 1) {
            return [0,0,0,0,0];
        }

        // compute  /////////////////////
        let depth: number[] = [];
        for(let fingerIdx = 0; fingerIdx < 5; fingerIdx++){
            let FL: number[] = [];
            FL = this.lengthsBetweenLandmarks(this._prjLandmarks[fingerIdx]);
            // console.log("FL: ", FL);

            let rads = [];
            for(let idx in this._stdFL[fingerIdx]){
                rads.push(Math.acos(FL[idx] / this._stdFL[fingerIdx][idx]));
            }
            // console.log('rads: ', rads);

            // reduce
            depth[fingerIdx] = rads.reduce((depthAcc, rad, idx) => {
                if(idx !== 0){
                    return this._stdFL[fingerIdx][idx] * Math.sin(rad) + depthAcc;
                }
                return 0;
            }, 0);
        }

        // update maxDepth
        this.updateMaxDepth(depth);

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
        this._stdLandmarks = this.getNthFinger(landmarks) as NormalizedLandmarkListList;
        let tmpStdFL: number[][] = [];
        for(let i = 0; i < 5; i++){
            tmpStdFL.push(this.lengthsBetweenLandmarks(this._stdLandmarks[i]));
        }
        this._stdFL = tmpStdFL;
        // _stdFL
        console.log('%c standard logged!!', "color: blue");
    }

    private updateMaxDepth(depth: number[]): void {
        this.maxDepth = depth.map((d, i) =>  isNaN(d)? this.maxDepth[i]: Math.max(this.maxDepth[i], d));
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
     * 獲得第n隻手指，或是獲得整隻手掌(5隻手指裝在陣列)
     * @param landmarks 整隻手的關節點
     * @param n 第ｎ隻手指。預設為-1，代表回傳整隻手
     * @returns 回傳第n隻手指，若n為預設值-1時，回傳所有手指手
     */
    public getNthFinger(landmarks: NormalizedLandmarkList, 
                        n: number = -1): NormalizedLandmarkList | NormalizedLandmarkListList{
        let nthFinger: NormalizedLandmarkListList = [[], [], [], [], []];
        landmarks.map((lm, idx) => {
            if([0, 1, 2, 3, 4].indexOf(idx) !== -1) {
                nthFinger[0].push(lm);
            }
            if([0, 5, 6, 7, 8].indexOf(idx) !== -1) {
                nthFinger[1].push(lm);
            }
            if([0, 9,10,11,12].indexOf(idx) !== -1) {
                nthFinger[2].push(lm);
            }
            if([0,13,14,15,16].indexOf(idx) !== -1) {
                nthFinger[3].push(lm);
            }
            if([0,17,18,19,20].indexOf(idx) !== -1) {
                nthFinger[4].push(lm);
            }
        });
        return n == -1? nthFinger : nthFinger[n];
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

// TODO: 需要針對不同手指設計按下的門檻值
//     V 規劃 readonly threshold: number[] = [0.09, 0.13, 0.15, 0.14, 0.10]
//       規劃 isNthFingerDown(): bool ?
//       這方法滿糟的，有時候門檻值適合，有時很差(觸發不了或是誤觸)
//       應該改用 depth max值的 90% (舉例)，作為門檻值
//       並需要時常更新門檻值
//       設計門檻值更新邏輯


