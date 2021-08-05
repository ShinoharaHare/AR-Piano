import * as THREE from 'three';
import { LandmarkHelper } from '../../hand_tracking';
import Behavior from '../Behavior';
import Hand from './Hand';


class HandBehavior extends Behavior {
    private _camera: THREE.Camera | null;
    private _raycaster: THREE.Raycaster
    private _vector: THREE.Vector2
    private _landmarks: LandmarkHelper | null;

    public get hand() { return this._target as Hand }
    public set camera(value: THREE.Camera) { this._camera = value }
    public set landmarks(value: LandmarkHelper | null) { this._landmarks = value }

    constructor(target?: Hand | null) {
        super(target)

        this._camera = null
        this._raycaster = new THREE.Raycaster()
        this._vector = new THREE.Vector2()
        this._landmarks = null
    }

    public setup() {
        if (!this._target || !this._camera) {
            throw new Error('Target or Camera is not set')
        }
    }

    public update() {
        if (this._landmarks?.landmarks) {
            this.hand.visible = true
            let depth = 1
            for (let i = 0; i < 21; i++) {
                const landmark = this._landmarks.landmarks[i]
                const x = landmark.x * 2 - 1
                const y = -landmark.y * 2 + 1
                this._vector.x = x
                this._vector.y = y

                this._raycaster.setFromCamera(this._vector, this._camera!)
                this._raycaster.ray.at(depth + landmark.z * 1, this.hand.landmarks[i].position)
            }
        } else {
            this.hand.visible = false
        }
    }
}

export default HandBehavior
