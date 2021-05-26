import * as THREE from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { _window } from './utils'
import { Hands } from '@mediapipe/hands'
import { Core, Hand, HandControl, Keyboard, KeyboardControl } from './engine'


async function main() {
    const core = new Core()
    core.init({
        container: document.getElementById('container')!
    })
    const hands = initAndAttachMpHands(core)

    core.mainScene.add(new THREE.AmbientLight(0x666666))
    let pl = new THREE.PointLight('white')
    pl.position.y = 10
    core.mainScene.add(pl)

    let hand = new Hand()
    hand.visible = false
    let handControl = new HandControl(core, hand)

    hands.onResults(results => {
        if (results.multiHandLandmarks) {
            hand.visible = true
            handControl.updateLandmarks(results.multiHandLandmarks[0])
        } else {
            hand.visible = false
        }
    })

    core.mainScene.add(hand)

    // const geometry = new THREE.BoxGeometry(1, 1, 1)
    // const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
    // const box = new THREE.Mesh(geometry, material)
    // box.position.z = -7.5
    // box.position.y = -1
    // box.rotateY(45)
    // core.mainScene.add(box)

    const keyboard = new Keyboard()
    keyboard.position.y = -2
    keyboard.position.z = -25
    keyboard.rotateX(1)

    const tc = new TransformControls(core.arCamera, document.body)
    tc.attach(keyboard)

    const keyboardControl = new KeyboardControl(core, keyboard)

    // [4, 8, 16, 20]
    for (let i of [8]) {
        keyboardControl.addCollider(hand.landmarks[i])
    }

    core.mainScene.add(keyboard)
    core.mainScene.add(tc)

    // core.addMarker('pattern-marker.patt', new THREE.Mesh(geometry, material))

    core.run()
    // core.flipX()

    // let collided = false
    // core.addEventListener('render', () => {
    //     let detect = detectCollision(hand.landmarks[7], box)
    //     if (detect && !collided) {
    //         collided = true
    //         box.material.color = new Color('yellow')
    //         MIDIPlayer.noteOn(0, 60, 127)
    //     } else if (!detect && collided) {
    //         collided = false
    //         box.material.color = new Color('white')
    //         MIDIPlayer.noteOff(0, 60)
    //     }
    // })

    _window.core = core
}

function initAndAttachMpHands(core: Core) {
    const hands = new Hands({ locateFile: file => `mediapipe/${file}` })

    hands.setOptions({
        maxNumHands: 1,
        minTrackingConfidence: 0.9
    })

    let done = false
    core.addEventListener('render', async () => {
        if (done) {
            done = false
            await hands.send({ image: core.video })
            done = true
        }
    })

    _window.run = () => done = true
    return hands
}

// function detectCollision(obj1: Mesh, obj2: Mesh) {
//     let a = new Box3().setFromObject(obj1)
//     let b = new Box3().setFromObject(obj2)
//     return a.intersectsBox(b)
// }

main()
