import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { Hands, NormalizedLandmark, HAND_CONNECTIONS, Results, ResultsListener } from '@mediapipe/hands'
import * as THREE from 'three'
import { wait, _window } from './utils'

const hands = new Hands({
    locateFile: (file) => `mediapipe/${file}`
})

hands.setOptions({
    maxNumHands: 1,
    minTrackingConfidence: 0.9
})

hands.initialize()

export class Hand extends THREE.Group {
    landmarks: THREE.Mesh[] = []
    private raycaster = new THREE.Raycaster()
    private vector = new THREE.Vector2()

    constructor() {
        super()
        const geometry = new THREE.SphereGeometry(.1, 50, 50)
        const material = new THREE.MeshPhongMaterial({ color: 0x0000ff })
        geometry.computeBoundingSphere()

        for (let i = 0; i < 21; i++) {
            const mesh = new THREE.Mesh(geometry, material)
            this.landmarks.push(mesh)
            this.add(mesh)
        }
    }

    update(camera: THREE.Camera, landmarks: NormalizedLandmark[]) {
        const depth = estimateDepth(landmarks)
        for (let i = 0; i < 21; i++) {
            const landmark = landmarks[i]
            const x = landmark.x * 2 - 1
            const y = -landmark.y * 2 + 1
            this.vector.x = x
            this.vector.y = y
            
            this.raycaster.setFromCamera(this.vector, camera)
            // this.raycaster.ray.at(depth + landmark.z * 5, this.landmarks[i].position)
            this.raycaster.ray.at(depth, this.landmarks[i].position)
        }
    }
}

interface IParameter {
    video: HTMLVideoElement
    callback: ResultsListener
}

export async function run(params: IParameter) {
    await hands.initialize()
    hands.onResults(params.callback)

    for (; ;) {
        await hands.send({ image: params.video })
        await wait(1000 / 30)
    }
}

export function estimateDistance(landmarks: NormalizedLandmark[], width: number, height: number) {
    let x1 = landmarks[0].x
    let y1 = landmarks[0].y
    let x2 = landmarks[5].x
    let y2 = landmarks[5].y

    let dx = x2 - x1
    let dy = y2 - y1

    dx *= width
    dy *= height
    let d = Math.pow(dx, 2) + Math.pow(dy, 2)
    d = Math.pow(d, 0.5)

    const L = 9
    const F = 200 * 50 / 7.5
    return F * L / d
}

export function estimateDepth(landmarks: NormalizedLandmark[]) {
    let x1 = landmarks[0].x
    let y1 = landmarks[0].y
    let x2 = landmarks[5].x
    let y2 = landmarks[5].y

    let dx = x2 - x1
    let dy = y2 - y1
    // dx *= width
    // dy *= height
    let d = Math.pow(dx, 2) + Math.pow(dy, 2)
    d = Math.pow(d, 0.5)
    // 0.45 -> 5
    // 0.25 -> 10

    return -25 * d + 16.25
}
