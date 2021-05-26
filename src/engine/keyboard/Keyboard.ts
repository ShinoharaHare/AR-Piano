import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const loader = new GLTFLoader()
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

class Keyboard extends THREE.Object3D {
    keys: THREE.Mesh<THREE.BoxGeometry, THREE.MeshPhongMaterial>[] = []

    constructor() {
        super()
        this.load()
    }

    async load() {
        // const gltf = await loader.loadAsync('assets/Keyboard.glb')
        // const model = gltf.scene
        // this.add(model)
        const group = new THREE.Group()

        const geometry = new THREE.BoxGeometry(2, 1.25, 6)

        let x = 0
        for (let octave = 3; octave <= 3; octave++) {
            for (let note of notes) {
                const sharp = note.includes('#')
                const color = sharp ? 'black' : 'white'
                const material = new THREE.MeshPhongMaterial({
                    color,
                    transparent: true,
                    opacity: 0.7
                })

                const key = new THREE.Mesh(geometry, material)

                key.name = note + octave
                key.position.x = x
                key.material.color

                x += 2 + 0.1
                group.add(key)
                this.keys.push(key)
            }
        }

        group.translateX(-x / 2)
        this.add(group)
    }
}

export default Keyboard
