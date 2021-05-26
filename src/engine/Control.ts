import * as THREE from 'three'
import Core from './Core'

abstract class Control {
    protected core: Core
    constructor(core: Core) {
        this.core = core
        this.core.addEventListener('render', () => this.update())
    }  
    abstract update(): void
}

export default Control
