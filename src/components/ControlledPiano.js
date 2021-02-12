import { useState, useCallback } from 'react';
import JZZ from 'jzz';

import { getMidiEvent, getKeys, isIntervalValid } from '../utils/midiParser';

import {
  NOTE_ON_EVENT,
  NOTE_OFF_EVENT,
  ALL_NOTES_OFF_EVENT,
  instrumentsList,
} from '../utils/constants';

import useSoundFont from '../hooks/useSoundFont';
import useMidiController from '../hooks/useMidiController';
import SelectList from './SelectList';
import Piano from './Piano';

const ControlledPiano = () => {
  //stores the current notes being played as [{nodeId, midiValues },...]
  //noteId is the node ID used in the audioBuffer. This node is returned by the function SoundFont.play
  //and we need this ID to use soundFont.stop().
  //midiValues[3] is the midi message from the JZZ library [op, note, veloc]
  const [notes, setNotes] = useState([]);
  const [interval, setInterval] = useState(['A0', 'C8']); //piano interval

  //active soundfont
  const [
    instrument,
    setInstrument,
    playSoundFont,
    stopSoundFont,
  ] = useSoundFont(null, JZZ.lib.getAudioContext());

  //check the event sent by the connected instrument, plays the sound font and updates the notes state.
  const handleMidiInput = useCallback(
    (msg) => {
      let event = getMidiEvent(msg);

      switch (event) {
        case NOTE_ON_EVENT:
          setNotes((prevNotes) => {
            //plays sound font and adds new note to current notes state
            let node = playSoundFont(msg);
            return prevNotes.concat({ nodeId: node.id, midiValues: msg });
          });
          break;
        case NOTE_OFF_EVENT:
          setNotes((prevNotes) => {
            //stop sound font and remove note from current notes state
            stopSoundFont(msg, prevNotes);
            return prevNotes.filter((note) => note.midiValues[1] !== msg[1]);
          });
          break;
        default:
          return;
      }
    },
    [playSoundFont, stopSoundFont]
  );

  const {
    midiInputs,
    selectedMidiInput,
    setSelectedMidiInput,
  } = useMidiController([], -1, handleMidiInput);

  //check the event sent by the mouse click, plays the sound font and updates the notes state.
  // does almost the same as the handleMidiInput but only one note can be on at any given time
  const handleMouseInput = useCallback(
    (msg, stop = false) => {
      let event = getMidiEvent(msg);
      switch (event) {
        case NOTE_ON_EVENT:
          setNotes((previous) => {
            if (previous[0] && previous[0].midiValues[1] === msg[1]) {
              return previous;
            }
            if (instrument) instrument.stop();
            // let node = playSoundFont(msg, instrument);
            let node = playSoundFont(msg);
            return [{ nodeId: node.id, midiValues: msg }];
          });
          break;
        case NOTE_OFF_EVENT:
          setNotes((prevNotes) => {
            stopSoundFont(msg, prevNotes);
            return [];
          });
          break;
        case ALL_NOTES_OFF_EVENT:
          instrument.stop();
          setNotes([]);
          break;
        default:
          return;
      }
    },
    [instrument, playSoundFont, stopSoundFont]
  );

  function renderPiano() {
    if (isIntervalValid(interval[0], interval[1])) {
      return (
        <div style={{ margin: '2%' }}>
          <Piano
            pressedKeys={notes}
            initialNote={interval[0]}
            finalNote={interval[1]}
            fitHorizontally
            // alignCenter
            onMouseInput={selectedMidiInput === -1 ? handleMouseInput : null}
          />
        </div>
      );
    } else {
      return (
        <div style={{ color: 'red', textAlign: 'center', margin: '5%' }}>
          <h2>Invalid interval</h2>
        </div>
      );
    }
  }

  function renderComponents() {
    if (instrument === null) {
      return <div>Loading...</div>;
    } else {
      return (
        <div>
          <div
            className="configuration"
            style={{
              display: 'flex',
              justifyContent: 'space-evenly',
            }}
          >
            <SelectList
              label={`MIDI input `}
              options={midiInputs.map((input) => input.name)}
              nullValue={-1}
              nullDescr={'mouse input'}
              defaultValue={-1}
              selectedValue={selectedMidiInput.name || -1}
              onSelect={setSelectedMidiInput}
            />
            <SelectList
              label={`First key `}
              options={getKeys('A0', 'C8').filter(
                (note) => !note.includes('#')
              )}
              defaultValue={'A0'}
              selectedValue={interval[0]}
              onSelect={(value) => setInterval([value, interval[1]])}
            />
            <SelectList
              label={`Last key `}
              options={getKeys('A0', 'C8').filter(
                (note) => !note.includes('#')
              )}
              defaultValue={'C8'}
              selectedValue={interval[1]}
              onSelect={(value) => setInterval([interval[0], value])}
            />
            <SelectList
              label={`Instrument `}
              options={instrumentsList}
              defaultValue={instrument.name}
              selectedValue={instrument.name}
              onSelect={(value) => {
                setInstrument(value);
              }}
            />
          </div>
          {renderPiano()}
        </div>
      );
    }
  }

  return renderComponents();
};

export default ControlledPiano;
