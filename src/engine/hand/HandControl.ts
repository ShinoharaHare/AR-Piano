import * as THREE from 'three'
import { NormalizedLandmark } from '@mediapipe/hands'
import Hand from './Hand'
import Control from '../Control'
import Core from '../Core'


class HandControl extends Control {
    private _hand: Hand
    private _raycaster = new THREE.Raycaster()
    private _vector = new THREE.Vector2()
    private _landmarks: NormalizedLandmark[] | null = null

    constructor(core: Core, hand: Hand) {
        super(core)
        this._hand = hand
    }

    updateLandmarks(landmarks: NormalizedLandmark[]) {
        this._landmarks = landmarks
    }

    update() {
        if (this._landmarks) {
            const depth = estimateDepth(this._landmarks)
            for (let i = 0; i < 21; i++) {
                const landmark = this._landmarks[i]
                const x = landmark.x * 2 - 1
                const y = -landmark.y * 2 + 1
                this._vector.x = x
                this._vector.y = y

                this._raycaster.setFromCamera(this._vector, this.core.arCamera)
                // this.raycaster.ray.at(depth + landmark.z * 5, this.landmarks[i].position)
                this._raycaster.ray.at(depth, this._hand.landmarks[i].position)
            }
        }
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

export default HandControl
