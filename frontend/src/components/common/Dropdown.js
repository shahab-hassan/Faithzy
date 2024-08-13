import React from 'react';

const Dropdown = ({ options, onSelect, selected, isSimple }) => {

  return (
    <div>
      <select className={isSimple? "dropdown" : "dropdownPlus"} value={selected} onChange={(e)=> onSelect(e.target.value)}>
        {options &&
          options.map((option, index) => {
            return <option key={index} value={option}>{option}</option>
          })
        }
      </select>
    </div>
  );
};

export default Dropdown;
