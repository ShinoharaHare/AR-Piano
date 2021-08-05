import LandmarkHelper from './LandmarkHelper'
import { HandTracker, Result } from './HandTracker'

import { Hands, Options, HandsConfig, Results } from '@mediapipe/hands'

class MediaPipeTracker extends HandTracker {
    private _engine: Hands
    private _queue: Function[] = []

    constructor(options: Options, config?: HandsConfig) {
        super()
        this._engine = new Hands(config)
        this._engine.setOptions(options)
        this._engine.onResults(x => this._onResults(x))
    }

    private _onResults(results: Results) {
        const { multiHandLandmarks, multiHandedness } = results
        let result: Result = []
        if (multiHandedness && multiHandLandmarks) {
            for (let i = 0; i < multiHandedness.length; i++) {
                let landmarks = multiHandLandmarks[i]
                let handness = multiHandedness[i].label
                let x = new LandmarkHelper(landmarks, handness)
                result.push(x)
            }
        }
        const resolve = this._queue.shift()
        resolve?.(result)
    }

    public initialize() {
        return this._engine.initialize()
    }

    public async infer(image: HTMLVideoElement): Promise<Result> {
        this._engine.send({ image })
        let result = await new Promise<Result>(resolve => this._queue.push(resolve))
        return result
    }

}

export default MediaPipeTracker
