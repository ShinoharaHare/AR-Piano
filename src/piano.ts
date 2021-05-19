import { _window } from './utils'

import './vendor/MIDI.min.js'
import './vendor/Base64binary.js'

const MIDI = _window.MIDI

MIDI.loadPlugin({
    soundfontUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/',
    instrument: 'acoustic_grand_piano',
    onsuccess: () => {
        // MIDI.noteOn(0, 60, 127)
    }
})

export function noteOn(channel: number, note: number, dynamic: number, delay = 0) {
    MIDI.noteOn(channel, note, dynamic, delay)
}

export function noteOff(channel: number, note: number, delay = 0) {
    MIDI.noteOn(channel, note, delay)
}
