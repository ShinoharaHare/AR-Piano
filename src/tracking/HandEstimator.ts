import { AngleData } from './AngleData';

export abstract class HandEstimator {

    constructor() {

    }

    abstract estimateAngles(input: any, target?: AngleData): AngleData;
}
