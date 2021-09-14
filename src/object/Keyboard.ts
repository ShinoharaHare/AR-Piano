import * as THREE from 'three';
import { Box3, Sphere, Vector2 } from 'three';
import { ModelGameObject, MonoBehaviour } from '../core';
import { midiPlayer } from '../MIDIPlayer';
import { Hand } from './Hand';

type Mesh = THREE.Mesh<THREE.BufferGeometry, THREE.Material>;

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

class BaseKeyboardBehavior extends MonoBehaviour {
    get keyboard(): Keyboard { return this.gameObject as Keyboard; }

    protected currentPressedMap: Map<number, boolean> = new Map();
    protected lastPressedMap: Map<number, boolean> = new Map();

    constructor(keyboard: Keyboard) {
        super(keyboard);
    }

    override start() {
        for (let i = 0; i <= 24; i++) {
            this.lastPressedMap.set(i, false);
        }
    }

    override update() {
        for (let i = 0; i <= 24; i++) {
            if (this.currentPressedMap.get(i) && !this.lastPressedMap.get(i)) {
                this.press(i);
            } else if (!this.currentPressedMap.get(i) && this.lastPressedMap.get(i)) {
                this.release(i);
            }
        }

        this.lastPressedMap = new Map(this.currentPressedMap);
        this.currentPressedMap.clear();
    }

    press(i: number) {
        midiPlayer.noteOn(0, this.indexToNote(i), 127);
        this.keyboard.meshes[i].material = this.keyboard.pressedMaterial;
        this.keyboard.keys[i].rotation.y = -5 * Math.PI / 180;
    }

    release(i: number) {
        midiPlayer.noteOff(0, this.indexToNote(i));
        this.keyboard.meshes[i].material = this.keyboard.defaultMaterials[i];
        this.keyboard.keys[i].rotation.y = 0;
    }

    private indexToNote(idx: number) {
        let o = 4 + Math.floor(idx / 12)
        let i = idx % 12
        return `${noteNames[i]}${o}`
    }
}

class KeyboardMouseBehaviour extends BaseKeyboardBehavior {
    private camera?: THREE.Camera;
    private point: THREE.Vector2 = new Vector2();
    private raycaster: THREE.Raycaster = new THREE.Raycaster();
    private mouseDown: boolean = false;

    private setMousePosition(event: MouseEvent) {
        let element = event.target as HTMLElement;
        let offset = element.getBoundingClientRect();
        this.point.x = (event.clientX - offset.left) / element.offsetWidth * 2 - 1;
        this.point.y = -((event.clientY - offset.top) / element.offsetHeight * 2 - 1);
    }

    attach(camera: THREE.Camera, element: HTMLElement) {
        this.camera = camera;
        element.addEventListener('mousedown', event => {
            if (event.button === 0) {
                this.mouseDown = true;
                this.setMousePosition(event);
            }
        });

        element.addEventListener('mousemove', event => {
            if (this.mouseDown) {
                this.setMousePosition(event);
            }
        });

        element.addEventListener('mouseup', event => {
            if (event.button === 0) {
                this.mouseDown = false;
            }
        });
    }

    override update() {
        if (this.camera) {
            if (this.mouseDown) {
                this.raycaster.setFromCamera(this.point, this.camera);
                let intersect = this.raycaster.intersectObjects(this.keyboard.meshes)[0];
                if (intersect) {
                    const keyName = intersect.object.name;
                    let index = parseInt(keyName.substr(3, 2));
                    this.currentPressedMap.set(index, true);
                }
            } else {
                this.currentPressedMap.clear();
            }
        }

        super.update();
    }
}

class KeyboardHandBehaviour extends BaseKeyboardBehavior {
    private hand?: Hand;

    override update() {
        if (this.hand) {
            let bb1 = new Box3().setFromObject(this.keyboard.meshes[0]);
            let bb2 = new Box3().setFromObject(this.hand.bones[5]);
            let collided = bb1.intersectsBox(bb2);
            console.log(collided);
        }
    }
}

export class Keyboard extends ModelGameObject {
    readonly mouseBehavior: KeyboardMouseBehaviour = new KeyboardMouseBehaviour(this);
    readonly handBehavior: KeyboardHandBehaviour = new KeyboardHandBehaviour(this);
    readonly keys: Array<THREE.Object3D> = [];
    readonly meshes: Array<Mesh> = [];
    readonly pressedMaterial: THREE.MeshBasicMaterial = new THREE.MeshPhongMaterial({ color: 'yellow' })
    readonly defaultMaterials: THREE.Material[] = []

    constructor() {
        super('models/keyboard.glb');

        this.name = this.constructor.name;
    }

    private getChildren() {
        for (let i = 0; i <= 24; i++) {
            let key = this.getObjectByName(`Key${i}`)!;
            let mesh = key.getObjectByName(`Key${i}_mesh`)! as Mesh;
            this.keys.push(key);
            this.meshes.push(mesh);
            this.defaultMaterials[i] = this.meshes[i].material;
        }
    }

    protected override onModelLoaded(): void {
        this.getChildren();
    }
}
