import * as THREE from 'three';
import { GameObject } from './GameObject';

export class MonoBehaviour {
    constructor(readonly gameObject: GameObject) {
        this.gameObject = gameObject;
        this.gameObject.addEventListener('message', event => this.onMessage(event.message));
    }

    start(): void { }

    update(): void { }

    updateFixed(): void { }

    private onMessage(message: string): void {
        switch (message) {
            case 'start':
                this.start();
                break;
            case 'update':
                this.update();
                break;
            case 'updateFixed':
                this.updateFixed();
                break;
        }
    }

}
