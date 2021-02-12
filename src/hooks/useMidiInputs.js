import { useState, useEffect } from 'react';
import JZZ from 'jzz';

export default function useMidiInputs(defaultValue) {
  const [midiInputs, setMidiInputs] = useState(defaultValue);

  // updates the midi-in port list
  useEffect(() => {
    console.log('connect');

    //updates the connected midi devices
    const updateInputsList = (webmidi) => {
      let ports = [];
      webmidi.inputs.forEach(function (input) {
        ports.push(input);
      });
      setMidiInputs(ports);
      // disableInput();
    };

    JZZ.requestMIDIAccess().then(
      function (webmidi) {
        updateInputsList(webmidi);

        //listen to connected and disconnected devices
        JZZ().onChange(function (device) {
          console.log(device);
          updateInputsList(webmidi);
          console.log('set input list');
        });
      },
      function (err) {
        console.log('Cannot start WebMIDI!');
        if (err) console.log(err);
      }
    );
    return () => {
      JZZ.close();
    };
  }, []);

  return [midiInputs, setMidiInputs];
}
