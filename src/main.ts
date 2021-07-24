import * as THREE from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { _window } from './utils'
import { Hands } from '@mediapipe/hands'
import { Core, Hand, HandBehavior, Keyboard, KeyboardBehavior } from './engine'
import { Depth } from './engine/hand/Depth'
import { filter } from 'rxjs/operators'



async function main() {
    var geometry = new THREE.CircleGeometry(0.02, 32);
    const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    const circle = new THREE.Mesh( geometry, material );
    // circle.position.y = 1;
    circle.position.z = -2;


    // Depth.ts
    const depth = new Depth();
    _window.depth = depth;
    // depth.depthOb.subscribe(console.log);
    // _window.max = -69;  _window.min =  69;
    depth.depthOb.pipe(
        // filter(v => !isNaN(v))
    ).subscribe(d => { 
        const target: number = 1;
        console.log(d);
        if(d[target] > 0.15){   
            circle.material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        }else{
            circle.material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
        }
        // _window.max = Math.max(_window.max, d);
        // _window.min = Math.min(_window.min, d);
    });


    // =======================================================
    const core = new Core()
    core.init({
        container: document.getElementById('container')!
    })
    const hands = initAndAttachMpHands(core)

    core.add(new THREE.AmbientLight(0x666666))
    core.add(new THREE.DirectionalLight(0xffffff, 0.6))

    let hand = new Hand()
    let handBehavior = new HandBehavior()
    handBehavior.setCamera(core.arCamera)
    hand.attachBehavior(handBehavior)
    core.add(hand)

    hands.onResults(results => {
        let landmarks = results.multiHandLandmarks?.[0]
        handBehavior.setLandmarks(landmarks || null)
        if (landmarks) {
            // ==============================
            depth.updateLandmarks(landmarks);
            // ==============================
            let pts = []
            // [4, 8, 12, 16, 20]
            for (let [idx, i] of [4, 8, 12, 16, 20].entries()) {
                if(depth.depth[idx] > depth.threshold[idx]){  // add depth of finger check
                    let x = landmarks[i].x
                    let y = landmarks[i].y
                    x = x * 2 - 1
                    y = -(y * 2 - 1)
                    pts.push(new THREE.Vector2(x, y))
                }
            }
            keyboardBehavior.setViewportPoints(pts)
        }
    })

    const keyboard = new Keyboard()
    const keyboardBehavior = new KeyboardBehavior()
    keyboard.attachBehavior(keyboardBehavior)
    // keyboard.position.y = 0
    keyboard.rotateX(0.5)
    keyboard.position.z = -3
    keyboard.scale.multiplyScalar(3)
    // // keyboard.rotateX(1)
    _window.keyboard = keyboard

    const tc = new TransformControls(core.arCamera, document.body)
    tc.attach(keyboard)

    core.add(keyboard)
    core.add(tc)

    // =======================
    core.add(circle);
    // =======================

    // core.addMarker('pattern-marker.patt', new THREE.Mesh(geometry, material))

    core.flipX()
    core.run()
    _window.core = core
    _window.hand = hands
}

function initAndAttachMpHands(core: Core) {
    const hands = new Hands({ locateFile: file => `mediapipe/${file}` })
    hands.initialize()
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

    setTimeout(() => done = true, 3000)

    _window.run = () => done = true
    return hands
}

main()
