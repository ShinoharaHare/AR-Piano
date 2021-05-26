import * as THREE from 'three'
import { Box3, Sphere } from 'three'
import MIDIPlayer from '../../MIDIPlayer'
import Control from '../Control'
import Core from '../Core'
import Keyboard from './Keyboard'

class KeyboardControl extends Control {
    private _keyboard: Keyboard
    private _map: Map<string, boolean> = new Map()
    private _colliders: Array<THREE.Object3D> = []
    private _pressed = false

    vector = new THREE.Vector2()
    raycaster = new THREE.Raycaster()

    constructor(core: Core, keyboard: Keyboard) {
        super(core)
        this._keyboard = keyboard

        const a = (e: MouseEvent) => this._pressed = true
        const b = (e: MouseEvent) => {
            let x = e.clientX - core.container.offsetLeft
            let y = e.clientY - core.container.offsetTop

            x /= core.canvas.width
            y /= core.canvas.height

            x = x * 2 - 1
            y = -(y * 2 - 1)
            this.vector.x = x
            this.vector.y = y
        }
        const c = (e: MouseEvent) => this._pressed = false

        core.container.addEventListener('mousedown', a)
        // core.container.addEventListener('touchstart', a)
        core.container.addEventListener('mousemove', b)
        // core.container.addEventListener('touchmove', b)
        core.container.addEventListener('mouseup', c)
        // core.container.addEventListener('touchend', c)
    }

    addCollider(object: THREE.Object3D) {
        this._colliders.push(object)
    }

    updateMouse() {
        if (this._pressed) {
            this.raycaster.setFromCamera(this.vector, this.core.arCamera)
            let intersects = this.raycaster.intersectObjects(this._keyboard.keys)
            const map = new Map<string, boolean>()

            if (intersects[0]) {
                map.set(intersects[0].object.name, true)
            }

            for (let key of this._keyboard.keys) {
                if (map.get(key.name) && !this._map.get(key.name)) {
                    key.material.color = new THREE.Color('yellow')
                    MIDIPlayer.noteOn(0, key.name, 126)
                } else if (!map.get(key.name) && this._map.get(key.name)) {
                    const color = key.name.includes('#') ? 'black' : 'white'
                    key.material.color = new THREE.Color(color)
                    MIDIPlayer.noteOff(0, key.name)
                }
            }
            this._map = map
        } else {
            for (let key of this._keyboard.keys) {
                const color = key.name.includes('#') ? 'black' : 'white'
                key.material.color = new THREE.Color(color)
                if (this._map.size > 0) {
                    MIDIPlayer.noteOff(0, key.name)
                }
            }
            this._map.clear()
        }
    }

    update() {
        // this.updateMouse()
        let set1: THREE.Sphere[] = []
        let set2: THREE.Box3[] = []

        for (let collider of this._colliders) {
            let s = new THREE.Sphere(collider.position, 0.25)
            set1.push(s)
        }

        for (let key of this._keyboard.keys) {
            let b = new THREE.Box3().setFromObject(key)
            set2.push(b)
        }

        const map = new Map()

        for (let a of set1) {
            for (let i in set2) {
                if (a.intersectsBox(set2[i])) {
                    map.set(this._keyboard.keys[i].name, true)
                }
            }
        }

        for (let key of this._keyboard.keys) {
            if (map.get(key.name) && !this._map.get(key.name)) {
                key.material.color = new THREE.Color('yellow')
                MIDIPlayer.noteOn(0, key.name, 126)
            } else if (!map.get(key.name) && this._map.get(key.name)) {
                const color = key.name.includes('#') ? 'black' : 'white'
                key.material.color = new THREE.Color(color)
                MIDIPlayer.noteOff(0, key.name)
            }
        }
        this._map = map
    }
}

export default KeyboardControl
