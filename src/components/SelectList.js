const SelectList = (props) => {
  const handleChange = (event) => {
    let input = props.options.filter((input) => input === event.target.value);

    props.onSelect(input[0] || props.defaultValue);
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <label>{props.label}</label>

      <select
        value={props.selectedValue || props.defaultValue}
        onChange={handleChange}
      >
        {props.nullValue && (
          <option value={props.nullValue}>{props.nullDescr}</option>
        )}

        {props.options.map((port) => {
          return (
            <option value={port} key={port}>
              {port}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SelectList;
