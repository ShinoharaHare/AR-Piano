import * as THREE from 'three';
import { GameObject } from './GameObject';

export class MonoBehaviour {
    constructor(readonly gameObject: GameObject) {
        this.gameObject = gameObject;
        this.gameObject.addEventListener('message:behaviour', event => this.onMessage(event.message));
    }

    start(): void { }

    update(): void { }

    fixedUpdate(): void { }

    private onMessage(message: string): void {
        switch (message) {
            case 'start':
                this.start();
                break;
            case 'update':
                this.update();
                break;
            case 'fixedUpdate':
                this.fixedUpdate();
                break;
        }
    }

}
