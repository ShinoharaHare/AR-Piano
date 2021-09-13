import { ModelGameObject, MonoBehaviour } from '../core';
import { midiPlayer } from '../MIDIPlayer';

type Mesh = THREE.Mesh<THREE.BufferGeometry, THREE.Material>;

const noteName = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

class KeyboardBehavior extends MonoBehaviour {
    get keyboard(): Keyboard { return this.gameObject as Keyboard; }

    private noteMap: Map<string, { key: THREE.Object3D, mesh: Mesh }> = new Map();

    constructor(keyboard: Keyboard) {
        super(keyboard);
    }

    start() {
        
    }

    update() {

    }
    
    press(key: string) {

    }

    release(key: string) {

    }
}

export class Keyboard extends ModelGameObject {
    readonly behavior: KeyboardBehavior = new KeyboardBehavior(this);
    readonly keys: Array<THREE.Object3D> = [];
    readonly meshes: Array<Mesh> = [];

    constructor() {
        super('models/keyboard.glb');
        this.name = 'Keyboard';
    }

    private getKeys() {
        for (let i = 0; i <= 24; i++) {
            let key = this.getObjectByName(`Key${i}`)!;
            let mesh = key.getObjectByName(`Key${i}_mesh`)! as Mesh;
            this.keys.push(key);
            this.meshes.push(mesh);
        }
    }

    protected onModelLoaded() {
        this.getKeys();
    }
}
