import * as THREE from 'three'
import { LandmarkHelper } from '../../hand_tracking';
import MIDIPlayer from '../../MIDIPlayer';
import { _window } from '../../utils';
import Behavior from '../Behavior';
import Keyboard from './Keyboard';

const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

type Mesh = THREE.Mesh<THREE.BufferGeometry, THREE.Material>

class KeyboardBehavior extends Behavior {
    private _viewportPoints: THREE.Vector2[]
    private _raycaster: THREE.Raycaster
    private _keyPressed: Map<string, boolean>
    private _materialMap: Map<string, THREE.Material>
    private _keys: Map<string, THREE.Object3D>
    private _meshes: Map<string, Mesh>
    private _pressedMatrerial: THREE.Material;
    private _landmarks: LandmarkHelper | null = null;

    public get keyboard() { return this._target as Keyboard }

    public set landmarks(value: LandmarkHelper | null) {
        this._landmarks = value
        this._viewportPoints = []

        if (this._landmarks) {
            const fingertip = [4, 8, 12, 16, 20]
            for (let i = 0; i < 5; i++) {
                if (this._landmarks.pressed?.[i]) {
                    let { x, y } = this._landmarks.landmarks[fingertip[i]]
                    x = x * 2 - 1
                    y = -y * 2 + 1
                    this._viewportPoints.push(new THREE.Vector2(x, y))
                }
            }
        }
    }

    public constructor(target?: Keyboard | null) {
        super(target)

        this._viewportPoints = []
        this._keyPressed = new Map()
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
                this._keyPressed.set(note, false)
            }
        })
    }

    public update(camera: THREE.Camera) {
        let currentKeyPressed = new Map<string, boolean>()

        for (let v of this._viewportPoints) {
            this._raycaster.setFromCamera(v, camera)
            let intersect = this._raycaster.intersectObjects([...this._meshes.values()])[0]
            if (intersect) {
                const keyName = intersect.object.name
                let note = this.idxToNote(parseInt(keyName.substr(3, 2)))
                currentKeyPressed.set(note, true)
            }
        }

        for (let note of this._keyPressed.keys()) {
            let mesh = this._meshes.get(note)!
            if (currentKeyPressed.get(note) && !this._keyPressed.get(note)) {
                MIDIPlayer.noteOn(0, note, 126)
                mesh.material = this._pressedMatrerial
                this._keyPressed.set(note, true)
            } else if (!currentKeyPressed.get(note) && this._keyPressed.get(note)) {
                MIDIPlayer.noteOff(0, note)
                mesh.material = this._materialMap.get(mesh.name)!
                this._keyPressed.set(note, false)
            }
        }
    }

    private idxToNote(idx: number) {
        let o = 4 + Math.floor(idx / 12)
        let i = idx % 12
        return `${notes[i]}${o}`
    }
}

export default KeyboardBehavior
