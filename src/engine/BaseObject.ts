import * as THREE from 'three'
import Behavior from './Behavior'

abstract class BaseObject extends THREE.Object3D {
    protected behaviors: Behavior[] = []

    constructor() {
        super()
    }

    public attachBehavior(...behaviors: Behavior[]) {
        behaviors.forEach(x => {
            x.attach(this)
            this.behaviors.push(x)
        })
    }

    public setup() {
        this.behaviors.forEach(x => x.setup())
    }

    public update(camera: THREE.Camera) {
        this.behaviors.forEach(x => x.update(camera))
    }
}

export default BaseObject
