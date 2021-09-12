import { GameObject, MonoBehaviour } from '../core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Handedness } from '../types';
import { AngleData } from '../tracking/AngleData';


const fingerNames = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];

class HandBehavior extends MonoBehaviour {
    angleData: AngleData = new AngleData();

    get hand(): Hand { return this.gameObject as Hand; }

    constructor(gameObject: GameObject) {
        super(gameObject);
    }

    update() {
        if (this.hand.loaded) {
            for (let i = 0; i < 15; i++) {
                this.hand.bones[i].rotation.x = -this.angleData.getByIndex(i);
            }
        }
    }
}

export class Hand extends GameObject {
    behavior: HandBehavior = new HandBehavior(this);
    bones: THREE.Bone[] = [];

    private handednessInternal: Handedness = Handedness.Left;
    private loadedInternal: boolean = false;

    get loaded() { return this.loadedInternal; }

    get handedness(): Handedness { return this.handednessInternal; }
    set handedness(handedness: Handedness) {
        this.handednessInternal = handedness;
        this.onChangeHandedness();
    }

    constructor(handedeness: Handedness = Handedness.Left) {
        super();

        this.name = this.constructor.name;
        this.handedness = handedeness;

        this.load();
    }

    private async load() {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync('models/hand.glb');
        this.add(gltf.scene);

        this.loadBones();

        this.loadedInternal = true;

        this.onLoaded();
    }

    private loadBones() {
        for (let finger of fingerNames) {
            for (let i = 1; i <= 3; i++) {
                let bone = this.getObjectByName(`${finger}${i}`) as THREE.Bone;
                this.bones.push(bone);
            }
        }
    }

    private onLoaded() {
        this.onChangeHandedness();
    }

    private onChangeHandedness() {
        if (this.loaded) {
            let root = this.getObjectByName('Armature')!;
            root.scale.y = Math.abs(root.scale.y) * (this.handedness === Handedness.Left ? 1 : -1);
        }
    }
}
