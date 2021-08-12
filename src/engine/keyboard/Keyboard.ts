import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import BaseObject from '../BaseObject'


class Keyboard extends BaseObject {
    keys: THREE.Object3D[]

    public constructor() {
        super()

        this.name = 'Keyboard'

        this.keys = []
        this.loadModel()
    }

    private async loadModel() {
        const loader = new GLTFLoader()
        const gltf = await loader.loadAsync('assets/keyboard.glb')
        gltf.scene.scale.multiplyScalar(0.005)
        gltf.scene.rotateY(1.57)
        gltf.scene.rotateZ(0.5)
        this.add(gltf.scene)

        this.getKeys()

        this.dispatchEvent({ type: 'loaded' })
    }

    private getKeys() {
        for (let i = 0; i <= 24; i++) {
            const key = this.getObjectByName(`Key${i}`)!
            this.keys.push(key)
        }
    }
}

export default Keyboard
