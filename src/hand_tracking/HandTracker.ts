import LandmarkHelper from './LandmarkHelper'

export type Result = LandmarkHelper[]
export type Callback = (result: Result) => void

export abstract class HandTracker {
    private _video: HTMLVideoElement | null = null
    private _callback: Callback | null = null
    private _intervalId: number | null = null
    private _lock: boolean = false

    constructor() {

    }

    public track(image: HTMLVideoElement, callback: (results: Result) => void) {
        this._video = image
        this._callback = callback
        this._intervalId = window.setInterval(() => this._lock || this._tick(), 1000 / 30)
    }

    public stop() {
        if (this._intervalId) {
            window.clearInterval(this._intervalId)
            this._intervalId = null
        }
    }

    private async _tick() {
        this._lock = true
        if (this._video && this._video.currentTime > 0 && this._callback) {
            let image = await this.infer(this._video)
            this._callback(image)
        }
        this._lock = false
    }

    public abstract infer(image: HTMLVideoElement): Promise<Result>
}

export default HandTracker
