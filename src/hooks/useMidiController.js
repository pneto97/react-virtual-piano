import { useState, useEffect, useCallback } from 'react';
import JZZ from 'jzz';

import useMidiInputs from './useMidiInputs';

export default function useMidiController(
  defaultMidiInputs,
  defaultMidiInput,
  inputHandler
) {
  // keeps track of the selected value in the SelectMidiInput component
  const [selectedMidiInput, _setSelectedMidiInput] = useState(defaultMidiInput);

  // should contain the selectedMidiInput opened by the JZZ library
  const [openedInput, setOpenedInput] = useState(null);

  // midiInputs should contain all available midi inputs and be updated automatically when something is added or removed
  const [midiInputs, setMidiInputs] = useMidiInputs(defaultMidiInputs);

  //disconnect previous input and set the new one based on the select list value

  const setSelectedMidiInput = useCallback(
    (value) => {
      if (openedInput) {
        openedInput.disconnect();
        openedInput.close();
        setOpenedInput(null);
      }

      _setSelectedMidiInput(
        midiInputs.find((input) => value === input.name) || -1
      );
    },
    [midiInputs, openedInput]
  );

  //called when selecting another midi input. onMidiInSuccess opens a new connection and closes previous ones
  // when inputHandler is set it will start listening to midi inputs
  useEffect(() => {
    console.log('select');

    // console.log('entrou');

    //disconnects the old input and updates the state with a new one
    const updateInput = (input) => {
      setOpenedInput((prevInput) => {
        if (prevInput) {
          prevInput.disconnect();
          prevInput.close();
        }
        return input;
      });
    };

    // if a midi input is selected, open the input and start listening
    JZZ.requestMIDIAccess().then(
      function (webmidi) {
        if (selectedMidiInput !== -1) {
          JZZ()
            .openMidiIn(selectedMidiInput)
            .or('Cannot open MIDI In port!')
            .and(function onMidiInSuccess() {
              this.connect(function (msg) {
                inputHandler(msg);
              });

              updateInput(this);
            });
        }
      },
      function (err) {
        console.log('Cannot start WebMIDI!');
        if (err) console.log(err);
      }
    );

    return () => {
      setOpenedInput((prevInput) => {
        if (prevInput) {
          prevInput.disconnect();
          // prevInput.close();
        }
        return null;
      });
      // JZZ.close();
    };
  }, [inputHandler, selectedMidiInput]);

  return {
    midiInputs,
    setMidiInputs,
    selectedMidiInput,
    setSelectedMidiInput,
  };
}
