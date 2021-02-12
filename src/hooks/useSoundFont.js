import { useState, useEffect, useCallback } from 'react';
import Soundfont from 'soundfont-player';
import JZZ from 'jzz';

export default function useSoundFont(initialValue, audioContext) {
  const [instrument, setInstrument] = useState(initialValue);

  useEffect(() => {
    console.log('setting instrument');
    Soundfont.instrument(audioContext, 'acoustic_grand_piano').then(function (
      piano
    ) {
      // console.log(piano);
      setInstrument(piano);
    });
  }, [audioContext]);

  const changeInstrument = useCallback(
    (name) => {
      Soundfont.instrument(audioContext, name).then(function (instr) {
        setInstrument(instr);
      });
    },
    [audioContext]
  );

  //msg is the midi message: [eventCode, keyCode, velocity]
  const playSoundFont = useCallback(
    (msg) => {
      if (instrument) {
        return instrument.play(msg[1], JZZ.lib.getAudioContext().currentTime, {
          gain: msg[2] / 128,
          sustain: 0,
        });
      }
      return -1;
    },
    [instrument]
  );

  //msg is the midi message: [eventCode, keyCode, velocity]
  //noteArr is the array of current notes being played
  // this function stops all values in noteArr that have the same note as msg
  const stopSoundFont = useCallback(
    (msg, notesArr) => {
      if (instrument) {
        let currentNote = notesArr.filter(
          (note) => note.midiValues[1] === msg[1]
        );

        currentNote.forEach((note) => {
          if (note) {
            instrument.stop(JZZ.lib.getAudioContext().currentTime, [
              note.nodeId,
            ]);
          }
        });
      }
      return -1;
    },
    [instrument]
  );

  return [instrument, changeInstrument, playSoundFont, stopSoundFont];
}
