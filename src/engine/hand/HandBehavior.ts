import { NormalizedLandmark } from '@mediapipe/hands';
import * as THREE from 'three';
import Behavior from '../Behavior';
import Hand from './Hand';

class HandBehavior extends Behavior {
    private _camera: THREE.Camera | null
    private _raycaster: THREE.Raycaster
    private _vector: THREE.Vector2
    private _landmarks: NormalizedLandmark[] | null
    private _pressed: boolean[]

    get hand() { return this._target as Hand }

    constructor(target?: Hand | null) {
        super(target)

        this._camera = null
        this._raycaster = new THREE.Raycaster()
        this._vector = new THREE.Vector2()
        this._landmarks = null
        this._pressed = new Array(10).fill(false)
    }

    public setup() {
        if (!this._target || !this._camera) {
            throw new Error('Target or Camera is not set')
        }
    }

    public update() {
        if (this._landmarks) {
            this.hand.visible = true
            const depth = 1
            for (let i = 0; i < 21; i++) {
                const landmark = this._landmarks[i]
                const x = landmark.x * 2 - 1
                const y = -landmark.y * 2 + 1
                this._vector.x = x
                this._vector.y = y

                this._raycaster.setFromCamera(this._vector, this._camera!)
                // this.raycaster.ray.at(depth + landmark.z * 5, this.landmarks[i].position)
                this._raycaster.ray.at(depth, this.hand.landmarks[i].position)
            }
        } else {
            this.hand.visible = false
        }
    }

    public setCamera(camera: THREE.Camera) {
        this._camera = camera
    }

    public setLandmarks(landmarks: NormalizedLandmark[] | null) {
        this._landmarks = landmarks
    }

}

function estimateDepth(landmarks: NormalizedLandmark[]) {
    let x1 = landmarks[0].x
    let y1 = landmarks[0].y
    let x2 = landmarks[5].x
    let y2 = landmarks[5].y

    let dx = x2 - x1
    let dy = y2 - y1
    let d = Math.pow(dx, 2) + Math.pow(dy, 2)
    d = Math.pow(d, 0.5)
    // 0.45 -> 5
    // 0.25 -> 10
    return -25 * d + 32.5
}

export default HandBehavior
