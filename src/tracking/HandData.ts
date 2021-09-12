import { NormalizedLandmark } from '@mediapipe/hands';
import { Handedness } from '../types';
import { AngleData } from './AngleData';

export class HandData {
    landmarks?: NormalizedLandmark[];
    handedness?: Handedness;
    angles?: AngleData;
}
