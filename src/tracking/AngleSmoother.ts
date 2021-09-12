import { AngleData } from './AngleData';

export class AngleSmoother {
    smoothAngle: AngleData = new AngleData();
    private angleDataPool: AngleData[] = [];

    private smoothCount: number = 5;
    private smoothTolerance: number = 5 * Math.PI / 180;

    private average: AngleData = new AngleData();
    private index: number = 0;

    constructor(smoothCount: number, smoothTolerance: number) {
        this.smoothCount = smoothCount;
        this.smoothTolerance = smoothTolerance;

        this.angleDataPool = Array.from({ length: this.smoothCount }, () => new AngleData());
    }

    update(angleData: AngleData): void {
        this.angleDataPool[this.index++].copy(angleData);

        let average = this.average.zero();
        for (let i = 0; i < this.angleDataPool.length; i++) {
            average.add(this.angleDataPool[i]);
        }
        average.divideScalar(this.angleDataPool.length);

        for (let i = 0; i < 15; i++) {
            let difference = average.getByIndex(i) - angleData.getByIndex(i);
            if (Math.abs(difference) > this.smoothTolerance) {
                this.smoothAngle.setByIndex(i, average.getByIndex(i));
            }
        }

        this.index %= this.smoothCount;
    }
}