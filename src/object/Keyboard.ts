import { ModelGameObject, MonoBehaviour } from '../core';

class KeyboardBehavior extends MonoBehaviour {
    get keyboard(): Keyboard { return this.gameObject as Keyboard; }

    constructor(keyboard: Keyboard) {
        super(keyboard);
    }

    update() {
        
    }
}

export class Keyboard extends ModelGameObject {
    readonly behavior: KeyboardBehavior = new KeyboardBehavior(this);

    constructor() {
        super('models/keyboard.glb');
    }

    protected onModelLoaded() {
        
    }
}
