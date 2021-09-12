import { AngleData } from './AngleData';

export class AngleSmoother {
    readonly smoothAngle: AngleData = new AngleData();
    private angleDataPool: AngleData[] = [];

    private average: AngleData = new AngleData();
    private index: number = 0;

    constructor(private smoothCount: number = 5, private smoothTolerance: number = 2 * Math.PI / 180) {
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