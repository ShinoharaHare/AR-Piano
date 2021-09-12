import { NormalizedLandmark } from '@mediapipe/hands';
import { Vector3 } from 'three';
import { Finger, Knucle } from '../types';
import { AngleData } from './AngleData';
import { HandEstimator } from './HandEstimator';

export class MP3DEstimator extends HandEstimator {
    private vectors: Vector3[] = Array.from({ length: 21 }, () => new Vector3());
    private v1: Vector3 = new Vector3();
    private v2: Vector3 = new Vector3();

    constructor() {
        super();
    }

    private updateVectors(landmarks: NormalizedLandmark[]) {
        landmarks.forEach(({ x, y, z }, index) => {
            this.vectors[index].set(x, y, z);
        });
    }

    private calculateThumbProximalAngle(): number {
        let angle = 0;
        return angle;
    }

    private calculateFingerProximalAngle(finger: Finger): number {
        let idx = finger * 4 + 1;
        this.v1.subVectors(this.vectors[idx], this.vectors[0]);
        this.v2.subVectors(this.vectors[idx + 1], this.vectors[idx]);
        let angle = this.v1.angleTo(this.v2);
        return angle;
    }

    private calculateFingerAngle(finger: Finger, knuckle: Knucle): number {
        let idx = finger * 4 + knuckle;
        this.v1.subVectors(this.vectors[idx + 1], this.vectors[idx]);
        this.v2.subVectors(this.vectors[idx + 2], this.vectors[idx + 1]);
        let angle = this.v1.angleTo(this.v2);
        return angle;
    }

    estimateAngles(landmarks: NormalizedLandmark[], target?: AngleData): AngleData {
        target = target || new AngleData();

        this.updateVectors(landmarks);

        for (let i = 1; i < 5; i++) {
            target.set(i, 0, this.calculateFingerProximalAngle(i));
        }

        for (let i = 1; i < 5; i++) {
            for (let j = 1; j < 3; j++) {
                target.set(i, j, this.calculateFingerAngle(i, j));
            }
        }

        return target;
    }
}
