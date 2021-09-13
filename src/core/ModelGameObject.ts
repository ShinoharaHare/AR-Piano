import { GameObject } from './GameObject';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class ModelGameObject extends GameObject {
    private loadedInternal: boolean = false;
    get loaded(): boolean { return this.loadedInternal; }

    constructor(readonly modelPath: string) {
        super();

        this.ready = false;
        this.load();
    }

    private async load(): Promise<void> {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(this.modelPath);
        this.add(gltf.scene);

        this.onModelLoaded();
        this.onLoaded();
    }

    private onLoaded(): void {
        this.loadedInternal = true;
        this.ready = true;
    }

    protected onModelLoaded(): void { }
}