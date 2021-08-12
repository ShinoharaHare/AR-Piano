import * as THREE from 'three'
import BaseObject from '../BaseObject'


class Hand extends BaseObject {
    landmarks: THREE.Mesh[] = []

    constructor() {
        super()
        this.name = 'Hand'

        let geometry = new THREE.SphereGeometry(0.01, 50, 50)
        let material = new THREE.MeshPhongMaterial({ color: 0x0000ff })
        for (let i = 0; i < 21; i++) {
            let mesh = new THREE.Mesh(geometry, material)
            this.landmarks.push(mesh)
            this.add(mesh)
        }
    }
}

export default Hand
