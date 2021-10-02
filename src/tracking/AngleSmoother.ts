import { AngleData } from './AngleData';

export class AngleSmoother {
    readonly smoothAngle: AngleData = new AngleData();
    private angleDataPool: AngleData[] = [];

    private average: AngleData = new AngleData();
    private index: number = 0;

    public  smoothAngles2: Float32Array = new Float32Array(5);
    private angles2Pool: Float32Array[] = [];
    private average2: Float32Array = new Float32Array(5);
    private index2: number = 0;

    constructor(private smoothCount: number = 5, private smoothTolerance: number = 2 * Math.PI / 180) {
        this.angleDataPool = Array.from({ length: this.smoothCount }, () => new AngleData());
    }

    update(angleData: AngleData | Float32Array): void {
        if(angleData instanceof AngleData) {
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
        }else {  // angles2
            // 暫時不使用
            this.angles2Pool[this.index2++] = angleData;

            this.average2 = new Float32Array(5);
            this.angles2Pool.forEach((angles2) => {
                this.average2 = this.average2.map((v, idx) => (v + angles2[idx]) );
            });
            this.average2 = this.average2.map(v => v / this.angles2Pool.length );

            angleData.forEach((angle2, idx) => {
                let difference = this.average2[idx] - angle2;
                if(Math.abs(difference) > this.smoothTolerance) {
                    this.smoothAngles2[idx] = this.average2[idx];
                }
            });

            this.index2 %= 10;
        }
    }
}