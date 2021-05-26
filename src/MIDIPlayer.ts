import './vendor/MIDI.min.js'
import './vendor/Base64binary.js'
import { _window } from './utils'

const MIDI: any = global.MIDI

type NoteLike = number | string

class _MIDIPlayer {
    private static _instance = new _MIDIPlayer()
    static get instance() { return _MIDIPlayer._instance }

    private _ready = false
    private get ready() { return this._ready }

    private constructor() {
        MIDI.loadPlugin({
            soundfontUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/',
            instrument: 'acoustic_grand_piano',
            onsuccess: () => {
                this._ready = true
            }
        })
    }

    noteOn(channel: number, note: NoteLike, dynamic: number, delay = 0) {
        if (this._ready) {
            MIDI.noteOn(channel, toNote(note), dynamic, delay)
        }
    }

    noteOff(channel: number, note: NoteLike, delay = 0) {
        if (this._ready) {
            MIDI.noteOff(channel, toNote(note), delay)
        }
    }
}

function toNote(note: NoteLike) {
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    if (typeof note === 'string') {
        if (note.includes('#')) {
            note = note.replace('#', '')
            return MIDI.keyToNote[note] + 1
        } else {
            return MIDI.keyToNote[note]
        }
    }
    return note
}

_window.toNote = toNote

export default _MIDIPlayer.instance
