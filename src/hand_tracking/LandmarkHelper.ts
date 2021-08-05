import { NormalizedLandmark } from '@mediapipe/hands'


type Tuple3<T> = [T, T, T]
type Tuple5<T> = [T, T, T, T, T]
type Tuple5_3<T> = Tuple5<Tuple3<T>>

function createTuple3<T>(x: T): Tuple3<T> {
    return [x, x, x]
}

function createTuple5<T>(x: T | (() => T)): Tuple5<T> {
    return x instanceof Function ? [x(), x(), x(), x(), x()] : [x, x, x, x, x]
}

function createTuple5_3<T>(x: T): Tuple5_3<T> {
    return createTuple5(() => createTuple3(x))
}

export type Handedness = 'Left' | 'Right'

export class LandmarkHelper {
    private _standard: LandmarkHelper | null
    private _landmarks: NormalizedLandmark[]
    private _handedness: Handedness | null
    private _knuckleLengths: Tuple5_3<number> | null
    private _knuckleAngles: Tuple5_3<number> | null
    private _pressDepths: Tuple5<number> | null
    private _pressThresholds: Tuple5<number> | null
    private _pressed: Tuple5<boolean> | null

    public get landmarks() { return this._landmarks }
    public get handedness() { return this._handedness }
    public get knuckleLengths() { return this._knuckleLengths }
    public get knuckleAngles() { return this._knuckleAngles }
    public get pressDepths() { return this._pressDepths }
    public get pressed() { return this._pressed }

    public set pressThresholds(v: Tuple5<number>) { this._pressThresholds = v }

    public constructor(landmarks: NormalizedLandmark[], handedness: Handedness | null = null, standard: LandmarkHelper | null = null) {
        this._landmarks = landmarks
        this._handedness = handedness
        this._standard = standard
        this._knuckleLengths = null
        this._knuckleAngles = null
        this._pressDepths = null
        this._pressThresholds = null
        this._pressed = null
    }

    public setStandard(standard: LandmarkHelper, update: boolean = true) {
        this._standard = standard
        if (!this._standard._knuckleLengths) {
            this._standard.updateKnuckleLengths()
        }

        if (update) {
            this.update()
        }
    }

    public update() {
        this.updateKnuckleLengths()
        this.updateKnuckleAngles()
        this.updatePressDepths()

        if (this._pressThresholds) {
            this.updatePressed()
        }
    }

    public updateKnuckleLengths() {
        this._knuckleLengths = createTuple5_3(0)
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                let idx = i * 4 + j + 1;
                let distance = Math.pow(this._landmarks[idx].x - this._landmarks[idx + 1].x, 2)
                distance += Math.pow(this._landmarks[idx].y - this._landmarks[idx + 1].y, 2)
                distance = Math.sqrt(distance)
                this._knuckleLengths[i][j] = distance
            }
        }
    }

    public updateKnuckleAngles() {
        if (!this._knuckleLengths) {
            throw new Error('Must call `updateKnuckleLengths` first')
        }

        const cl = this._knuckleLengths!
        const sl = this._standard!._knuckleLengths!

        this._knuckleAngles = createTuple5_3(0)
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                this._knuckleAngles[i][j] = Math.acos(cl[i][j] / sl[i][j])
            }
        }
    }

    public updatePressDepths() {
        if (!this._knuckleAngles) {
            throw new Error('Must call `updateKnuckleAngles` first')
        }

        const sl = this._standard!._knuckleLengths!

        this._pressDepths = createTuple5(0)
        for (let i = 0; i < 5; i++) {
            this._pressDepths[i] = 0
            for (let j = 0; j < 3; j++) {
                this._pressDepths[i] += sl[i][j] * Math.sin(this._knuckleAngles[i][j])
            }
        }
    }

    public updatePressed() {
        if (!this._pressDepths) {
            throw new Error('Must call `updatePressDepths` first')
        }

        if (!this._pressThresholds) {
            throw new Error('Thresholds not set yet')
        }

        this._pressed = createTuple5(false)
        for (let i = 0; i < 5; i++) {
            this._pressed[i] = this._pressDepths[i] > this._pressThresholds[i]
        }
    }

    /*
    {
        landmarks: NormalizedLandmark[],
        handedness: Handednes
    }
    */
    public toJSON() {
        let { landmarks, handedness } = this
        let json = JSON.stringify({ landmarks, handedness })
        return json
    }

    public static fromJSON(json: string) {
        let { landmarks, handedness } = JSON.parse(json)
        return new LandmarkHelper(landmarks, handedness)
    }
}

export default LandmarkHelper
