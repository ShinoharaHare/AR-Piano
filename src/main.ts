import * as THREE from 'three'
import { Core } from './core'
import { estimateDepth, Hand, run } from './hand'
import { _window } from './utils'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Box3, Color, Mesh, Object3D, Sphere } from 'three'
import { noteOff, noteOn } from './piano'


function detectCollision(obj1: Mesh, obj2: Mesh){
    // obj1.geometry.computeBoundingSphere()
    // obj2.geometry.computeBoundingBox()
    let a = new Box3().setFromObject(obj1)
    let b = new Box3().setFromObject(obj2)
    return a.intersectsBox(b)
  }

async function main() {
    const core = new Core()
    core.init({
        container: document.getElementById('container')!
    })
    core.run()

    core.scene.add(new THREE.AmbientLight(0x666666))
    let pl = new THREE.PointLight('white')
    pl.position.y = 10
    core.scene.add(pl)

    let hand = new Hand()
    hand.visible = false
    core.scene.add(hand)

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
    geometry.computeBoundingSphere()
    const box = new THREE.Mesh(geometry, material)
    box.position.z = -7.5
    box.position.y = -1
    box.rotateY(45)
    core.scene.add(box)

    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync('assets/Keyboard.gltf')
    const model = gltf.scene
    model.scale.x = .125
    model.scale.y = .125
    model.scale.z = .125

    // core.scene.add(model)

    let collided = false

    _window.run = () => {
        run({
            video: core.video,
            callback(results) {
                // const ctx = canvas.getContext('2d')!
                // ctx.clearRect(0, 0, canvas.width, canvas.height)
                hand.visible = results.multiHandLandmarks != null
                if (results.multiHandLandmarks) {
                    const landmarks = results.multiHandLandmarks[0]
                    // drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 })
                    // drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 2 })
                    // estimateDepth(landmarks)
                    hand.update(core.camera, results.multiHandLandmarks[0])

                    if (detectCollision(hand.landmarks[7], box) && !collided) {
                        collided = true
                        box.material.color = new Color('yellow')
                        noteOn(0, 60, 127)
                    } else if (!detectCollision(hand.landmarks[7], box) && collided) {
                        collided = false
                        box.material.color = new Color('white')
                        noteOff(0, 60)
                    }
                }
            }
        })
    }
    _window.core = core
}

main()
