import { getFullNote } from '../utils/midiParser';

const Notes = (props) => {
  return (
    <div style={{ display: 'block', position: 'relative' }}>
      <h1>Notes</h1>
      {props.notes.map((note) => {
        return <div key={note}>{getFullNote(note[1])}</div>;
      })}
    </div>
  );
};

export default Notes;
