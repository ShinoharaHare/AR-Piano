import * as THREE from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { expose, wait, _window } from './utils'
import { MediaPipeTracker, LandmarkHelper } from './hand_tracking'
import { Core, Hand, HandBehavior, Keyboard, KeyboardBehavior } from './engine'


const tracker = new MediaPipeTracker(
    {
        maxNumHands: 1,
        minTrackingConfidence: 0.9,
        selfieMode: false
    },
    {
        locateFile: file => `mediapipe/${file}`
    }
)

async function main() {
    const core = new Core()
    core.init({
        container: document.getElementById('container')!
    })

    core.add(new THREE.AmbientLight(0x666666))
    core.add(new THREE.DirectionalLight(0xffffff, 0.6))

    let hand = new Hand()
    let handBehavior = new HandBehavior()

    handBehavior.camera = core.arCamera
    hand.attachBehavior(handBehavior)
    core.add(hand)

    let keyboard = new Keyboard()
    let keyboardBehavior = new KeyboardBehavior()

    keyboard.attachBehavior(keyboardBehavior)
    // keyboard.position.y = 0
    keyboard.rotateX(0.5)
    keyboard.position.z = -3.5
    keyboard.scale.multiplyScalar(3)
    // // keyboard.rotateX(1)
    keyboard.visible = true

    // const tc = new TransformControls(core.arCamera, document.body)
    // tc.attach(keyboard)
    // core.add(tc)

    core.add(keyboard)
    expose(keyboard, 'keyboard')
    expose(core, 'core')

    let json: string | null = null
    json = localStorage.getItem('standard')
    const standard = json ? LandmarkHelper.fromJSON(json) : null
    json = localStorage.getItem('thresholds')
    const thresholds = json ? JSON.parse(json) : null

    tracker.track(core.video, result => {
        let landmarks = result[0] || null
        if (landmarks && thresholds && standard) {
            landmarks.pressThresholds = thresholds
            landmarks.setStandard(standard)
        }
        keyboardBehavior.landmarks = landmarks
        handBehavior.landmarks = landmarks

        expose(landmarks, 'landmarks')
    })

    // core.addEventListener('render', async () => {
    // })

    core.run()
}

async function calibrate(delay: number, duration: number) {
    console.info('Start calibration')
    console.info(`Waiting for ${delay} ms`)

    await wait(delay)

    let standard: LandmarkHelper | null = null
    while (!standard) {
        standard = _window.landmarks
        await wait(1000 / 30)
    }

    console.info(`Saving standard landmarks`)
    localStorage.setItem('standard', standard!.toJSON())

    let thresholds = [0, 0, 0, 0, 0]
    console.info(`Calibrating thresholds for ${duration} ms`)
    let time = Date.now()
    while (Date.now() - time < duration) {
        let landmarks = _window.landmarks
        landmarks.setStandard(standard)

        for (let i = 0; i < 5; i++) {
            thresholds[i] = Math.max(thresholds[i], landmarks.pressDepths[i] || 0)
        }
        await wait(1000 / 30)
    }

    for (let i = 0; i < 5; i++) {
        thresholds[i] *= 0.8
    }

    localStorage.setItem('thresholds', JSON.stringify(thresholds))

    console.info(`Done`)
}

expose(calibrate)

main()
