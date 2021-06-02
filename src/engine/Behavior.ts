import BaseObject from './BaseObject'

abstract class Behavior {
    protected _target: BaseObject | null

    public constructor(target?: BaseObject | null) {
        this._target = target || null
    }

    public attach(target: BaseObject) {
        this._target = target
    }

    public abstract setup(): void
    public abstract update(camera: THREE.Camera): void
}

export default Behavior