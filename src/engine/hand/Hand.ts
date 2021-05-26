import * as THREE from 'three'
import HandControl from './HandControl'


class Hand extends THREE.Group {
    landmarks: THREE.Mesh[] = []

    constructor() {
        super()
        this.name = 'Hand'

        const geometry = new THREE.SphereGeometry(0.25, 50, 50)
        const material = new THREE.MeshPhongMaterial({ color: 0x0000ff })
        for (let i = 0; i < 21; i++) {
            const mesh = new THREE.Mesh(geometry, material)
            this.landmarks.push(mesh)
            this.add(mesh)
        }
    }
}

export default Hand
