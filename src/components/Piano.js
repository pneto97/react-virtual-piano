import { useMemo, useEffect, useState, useRef } from 'react';
import './style/Piano.css';
import {
  getFullNote,
  isWhiteKey,
  getMidiKeyCode,
  whiteKeysAmount,
} from '../utils/midiParser';
import useRefDimensions from '../hooks/useRefDimensions';

// note should be a white key
// this function returns the amount of space the note before "note" takes in the note span
// used by getBlackKeyOffset
const _getInitialOffset = (note, W, B, L, L1, L2) => {
  if (!isWhiteKey(note)) {
    console.log('note should be a white key.');
    return 0;
  }
  //get the note in the string format
  let key = getFullNote(note);

  switch (key[0]) {
    case 'E':
      return W - L1;
    case 'B':
      return W - L2;
    case 'D':
      return (W - L) / 2;
    case 'G':
      return W - L - B / 2;
    case 'A':
      return B / 2;
    default:
      return 0;
  }
};

//function that returns the black key offset from the initial key.
const getBlackKeyOffset = (note, initialNote, W, B, L, L1, L2) => {
  let leftOffset = _getInitialOffset(initialNote, W, B, L, L1, L2);

  for (let i = initialNote; i < note; i++) {
    if (!isWhiteKey(i)) {
      leftOffset += B;
    } else {
      let key = getFullNote(i)[0];
      switch (key) {
        case 'C':
        case 'E':
          leftOffset += L1;
          break;
        case 'F':
        case 'B':
          leftOffset += L2;
          break;
        default:
          leftOffset += L;
      }
    }
  }

  return leftOffset;
};

//props:
//        optional: [initialNote, finalNote, pressedKeys, fitHorizontally, alignCenter, noteWidth, whiteNoteWidth, whiteNoteHeight , blackNoteWidth, blackNoteHeight]
//        [whiteNoteWidth, whiteNoteHeight , blackNoteWidth and blackNoteHeight] will take priority over noteWidth
// initialNote and finalNote will be converted to white keys if necessary (the next one for the initial and previous one for the final)
// fitHorizontally takes priority over alignCenter, the difference is that fit horizontally takes the entire container and increases vertically as necessary
// alignCenter lets you customize the key sizes
const Piano = (props) => {
  // const targetRef = useRef(); //used in the container
  // const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { targetRef, dimensions } = useRefDimensions({
    width: 0,
    height: 0,
  });
  const onMouseInput = props.onMouseInput;
  const pressedKeys = props.pressedKeys || [];

  //set listeners for mouse input
  const [mouseButton, setMouseButton] = useState(false);
  useEffect(() => {
    const handleMouseDown = (event) => {
      // console.log(event.button);
      let target = event.target;
      if (target.id && event.button === 0) {
        setMouseButton(true);

        if (onMouseInput && target.className.split(' ')[0] === 'piano-key') {
          // send note on event
          onMouseInput([
            0x09 << 4,
            parseInt(target.id.substr(1, target.id.length), 10),
            127,
          ]);
        }
      }
    };
    const handleMouseUp = (event) => {
      setMouseButton(false);

      let target = event.target;
      if (target.id && event.button === 0) {
        if (onMouseInput && target.className.split(' ')[0] === 'piano-key') {
          // send note off event
          onMouseInput([
            0x08 << 4,
            parseInt(target.id.substr(1, target.id.length), 10),
            0,
          ]);
        }
      }
    };
    const handleMouseMove = (event) => {
      if (event.which === 1) {
        let target = event.target;
        if (target.id && mouseButton) {
          if (onMouseInput && target.className.split(' ')[0] === 'piano-key') {
            onMouseInput([
              0x09 << 4,
              parseInt(target.id.substr(1, target.id.length), 10),
              127,
            ]);
            return;
          }
        }
        onMouseInput([0x0b << 4, 123, 0]); //stop all notes event
      }
    };

    if (onMouseInput) {
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [onMouseInput, mouseButton]);

  let noteWidth = props.noteWidth || 38;
  let noteOffset = 0;

  //calculates the key width and offset to stretch the piano horizontally in the container if fitHorizontally is sent
  if (props.fitHorizontally) {
    let wk = whiteKeysAmount(
      getMidiKeyCode(props.initialNote),
      getMidiKeyCode(props.finalNote)
    );
    noteWidth = Math.floor(dimensions.width / wk);
    noteOffset = (dimensions.width - wk * noteWidth) / 2;
  }

  //calculates the offset to centralize in the container if props.alignCenter is sent, it might extrapolate the screen size
  //but now you can control the key sizes
  if (props.alignCenter) {
    let wk = whiteKeysAmount(
      getMidiKeyCode(props.initialNote),
      getMidiKeyCode(props.finalNote)
    );
    noteOffset = (dimensions.width - wk * noteWidth) / 2;
  }

  const whiteNoteWidth = props.whiteNoteWidth || noteWidth;
  const whiteNoteHeight = props.whiteNoteHeight || whiteNoteWidth * 3.125;
  const blackNoteWidth = props.blackNoteWidth || whiteNoteWidth * 0.6;
  const blackNoteHeight = props.blackNoteHeight || whiteNoteHeight * 0.63;
  let initialNote = props.initialNote ? getMidiKeyCode(props.initialNote) : 21; //A0 is default
  let finalNote = props.initialNote ? getMidiKeyCode(props.finalNote) : 108; //C8 is default

  initialNote = isWhiteKey(initialNote) ? initialNote : initialNote + 1;
  finalNote = isWhiteKey(finalNote) ? finalNote : finalNote - 1;

  //L is the distance between two black keys (except D# and F# )
  const L = useMemo(() => {
    return parseInt(whiteNoteWidth) / 2;
  }, [whiteNoteWidth]);

  //L1 is the distance from the end of D# key to F key
  // and the ditance from C to C#
  const L1 = useMemo(() => {
    return (3 * whiteNoteWidth - 2 * blackNoteWidth - L) / 2;
  }, [L, whiteNoteWidth, blackNoteWidth]);

  // Distance from F to F# and the end of A# to B
  const L2 = useMemo(() => {
    return (4 * whiteNoteWidth - 3 * blackNoteWidth - 2 * L) / 2;
  }, [L, whiteNoteWidth, blackNoteWidth]);

  let keys = [];

  //keys is an array that contains info about all keys that should be rendered
  // key -> midi code of the key
  // keyClass -> class that will be added to the html element indicating if it's a white or black key
  // style -> css style of the key
  keys = useMemo(() => {
    let arr = [];
    let whiteKeysAmount = 0;

    //loop through all the keys the Piano container should render
    for (let i = initialNote; i <= finalNote; i++) {
      if (!getFullNote(i).includes('#')) {
        //white key

        arr.push({
          key: i,
          keyClass: 'piano-key white-key',
          style: {
            width: `${whiteNoteWidth}px`,
            height: `${whiteNoteHeight}px`,
            top: '0px',
            left: `${
              parseInt(whiteNoteWidth, 10) * whiteKeysAmount + noteOffset
            }px`,
          },
        });

        whiteKeysAmount++;
      } else {
        //black key

        arr.push({
          key: i,
          keyClass: 'piano-key black-key',
          style: {
            width: `${blackNoteWidth}px`,
            height: `${blackNoteHeight}px`,
            top: '0px',
            left:
              noteOffset +
              getBlackKeyOffset(
                i,
                initialNote,
                whiteNoteWidth,
                blackNoteWidth,
                L,
                L1,
                L2
              ),
          },
        });
      }
    }
    return arr;
  }, [
    L,
    L1,
    L2,
    blackNoteHeight,
    blackNoteWidth,
    finalNote,
    initialNote,
    whiteNoteHeight,
    whiteNoteWidth,
    noteOffset,
  ]);

  const renderKeys = () => {
    return keys.map((note) => {
      //adds the class key-pressed to white-keys or black-keys if the Piano component receives pressed keys as props
      let keyClass = pressedKeys.map((n) => n.midiValues[1]).includes(note.key)
        ? `${note.keyClass} key-pressed`
        : note.keyClass;

      return (
        <div
          key={note.key}
          id={`n${note.key}`}
          className={keyClass}
          style={note.style}
        ></div>
      );
    });
  };

  return (
    <div
      className="piano-container"
      ref={targetRef}
      style={{
        height: `${whiteNoteHeight}px`,
      }}
    >
      {renderKeys()}
    </div>
  );
};

export default Piano;
