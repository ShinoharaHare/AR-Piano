import './vendor/MIDI.min.js'
import './vendor/Base64binary.js'
import { _window } from './utils'

const MIDI: any = global.MIDI

type NoteLike = number | string

class MIDIPlayer {
    private static _instance = new MIDIPlayer()
    static get instance() { return MIDIPlayer._instance }

    private _ready = false
    private get ready() { return this._ready }

    private constructor() {
        MIDI.loadPlugin({
            soundfontUrl: '/midi/',
            instrument: 'acoustic_grand_piano',
            onsuccess: () => {
                this._ready = true
                // this.noteOn(0, 65, 255)
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

export default MIDIPlayer.instance
