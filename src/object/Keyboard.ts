import { GameObject, MonoBehaviour } from '../core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class KeyboardBehavior extends MonoBehaviour {
    get keyboard(): Keyboard { return this.gameObject as Keyboard; }

    constructor(gameObject: GameObject) {
        super(gameObject);
    }

    update() {
        
    }
}

export class Keyboard extends GameObject {
    private behavior: KeyboardBehavior = new KeyboardBehavior(this);

    constructor() {
        super();
    }

    private async load() {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync('');
        this.add(gltf.scene);
    }
}
