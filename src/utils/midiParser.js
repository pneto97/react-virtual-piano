import {
  notes,
  NOTE_ON_EVENT,
  NOTE_OFF_EVENT,
  AFTER_TOUCH_EVENT,
  CONTROL_CHANGE_EVENT,
  SUSTAIN_ON_EVENT,
  SUSTAIN_OFF_EVENT,
  ALL_NOTES_OFF_EVENT,
} from './constants';

//evento de note on
// 0x9n
//evento note off
// 0x8n

export const getOctave = (note) => {
  return Math.floor(Math.floor(note) / 12 - 1);
};

export const getNoteName = (note) => {
  return notes[note % 12];
};

export const getFullNote = (note) => {
  return getNoteName(note) + getOctave(note);
};

export const isWhiteKey = (note) => {
  return !getFullNote(note).includes('#');
};

export const whiteKeysAmount = (startKey, endKey) => {
  let whiteKeys = 0;
  for (let i = startKey; i <= endKey; i++) {
    if (isWhiteKey(i)) whiteKeys++;
  }
  return whiteKeys;
};

//name should be in the format [req: note][opt: accidental][req: octave] like C#5, D4, A0, Cb...
// no double sharps, flats allowed
// if the code is passed it just returns the code
export const getMidiKeyCode = (name) => {
  if (!isNaN(name)) {
    return name;
  }

  let noteOffset = notes.indexOf(name[0]);
  let octaveOffset = name[name.length - 1] * 12;
  let accidentalOffset = 0;
  switch (name[1]) {
    case '#':
      accidentalOffset = 1;
      break;
    case 'b':
      accidentalOffset = -1;
      break;
    default:
      accidentalOffset = 0;
  }

  return 12 + octaveOffset + noteOffset + accidentalOffset;
};

//returns an array of keys in the string format
export const getKeys = (startKey, endKey) => {
  let arr = [];
  for (let i = getMidiKeyCode(startKey); i <= getMidiKeyCode(endKey); i++) {
    arr.push(getFullNote(i));
  }
  return arr;
};

export const isIntervalValid = (startKey, endKey) => {
  let allKeys = getKeys('A0', 'C8');
  let indexStartKey = allKeys.findIndex(
    (key) => getMidiKeyCode(key) === getMidiKeyCode(startKey)
  );
  let indexEndKey = allKeys.findIndex(
    (key) => getMidiKeyCode(key) === getMidiKeyCode(endKey)
  );

  if (
    indexStartKey !== -1 &&
    indexEndKey !== -1 &&
    indexStartKey < indexEndKey
  ) {
    return true;
  }

  return false;
};

// input is the midi msg from jzz library
// returns a string with the event name
export const getMidiEvent = (msg) => {
  let event = msg[0] >> 4;
  switch (event) {
    case 0x08:
      return NOTE_OFF_EVENT;
    case 0x09:
      return msg[2] ? NOTE_ON_EVENT : NOTE_OFF_EVENT;
    // if (msg[2] > 0) return NOTE_ON_EVENT;
    // else return NOTE_OFF_EVENT;
    case 0x0a:
      return AFTER_TOUCH_EVENT;
    case 0x0b: //control change
      if (msg[1] >= 64 && msg[1] <= 69) {
        return msg[2] < 64 ? SUSTAIN_OFF_EVENT : SUSTAIN_ON_EVENT;
      }
      if (msg[1] === 123 && msg[2] === 0) {
        return ALL_NOTES_OFF_EVENT;
      }
      return CONTROL_CHANGE_EVENT;
    default:
      return 'UNKNOWN';
  }
};
