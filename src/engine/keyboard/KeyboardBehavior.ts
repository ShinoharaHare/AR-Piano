import * as THREE from 'three'
import MIDIPlayer from '../../MIDIPlayer';
import { _window } from '../../utils';
import Behavior from '../Behavior';
import Keyboard from './Keyboard';

const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

type Mesh = THREE.Mesh<THREE.BufferGeometry, THREE.Material>

class KeyboardBehavior extends Behavior {
    private _viewportPoints: THREE.Vector2[]
    private _raycaster: THREE.Raycaster
    private _pressed: Map<string, boolean>
    private _materialMap: Map<string, THREE.Material>
    private _keys: Map<string, THREE.Object3D>
    private _meshes: Map<string, Mesh>
    private _pressedMatrerial: THREE.Material

    get keyboard() { return this._target as Keyboard }

    public constructor(target?: Keyboard | null) {
        super(target)

        this._viewportPoints = []
        this._pressed = new Map()
        this._raycaster = new THREE.Raycaster()
        this._materialMap = new Map()
        this._keys = new Map()
        this._meshes = new Map()

        this._pressedMatrerial = new THREE.MeshPhongMaterial({
            color: 'yellow'
        })
    }

    public setup() {
        if (!this._target) {
            throw new Error('Target is not set')
        }

        this.keyboard.addEventListener('loaded', () => {
            for (let i = 0; i <= 24; i++) {
                const note = this.idxToNote(i)
                let key = this.keyboard.getObjectByName(`Key${i}`)!
                let mesh = <Mesh>key.getObjectByName(`Key${i}_mesh`)
                this._materialMap.set(mesh.name, mesh.material)
                this._meshes.set(note, mesh)
                this._keys.set(note, key)
                this._pressed.set(note, false)
            }
        })

        _window.pressed = this._pressed
    }

    public update(camera: THREE.Camera) {
        let map = new Map<string, boolean>()

        for (let v of this._viewportPoints) {
            this._raycaster.setFromCamera(v, camera)
            let intersect = this._raycaster.intersectObjects([...this._meshes.values()])[0]
            if (intersect) {
                const keyName = intersect.object.name
                let note = this.idxToNote(parseInt(keyName.substr(3, 2)))
                map.set(note, true)
            }
        }

        for (let note of this._pressed.keys()) {
            let mesh = this._meshes.get(note)!
            if (map.get(note) && !this._pressed.get(note)) {
                MIDIPlayer.noteOn(0, note, 126)
                mesh.material = this._pressedMatrerial
                this._pressed.set(note, true)
            } else if (!map.get(note) && this._pressed.get(note)) {
                MIDIPlayer.noteOff(0, note)
                mesh.material = this._materialMap.get(mesh.name)!
                this._pressed.set(note, false)
            }
        }
    }

    public setViewportPoints(pts: THREE.Vector2[]) {
        this._viewportPoints = pts
    }

    private idxToNote(idx: number) {
        let o = 4 + Math.floor(idx / 12)
        let i = idx % 12
        return `${notes[i]}${o}`
    }
}

export default KeyboardBehavior
