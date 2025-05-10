import React from 'react'
import Select from 'react-select'
export const CustomSelect = ({
    label,
    options,
    value,
    onChange,
    placeholder,
    customStyles,
    className = '',
    important,
  }) => {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            className={` mb-3 block text-md font-medium text-black dark:text-white ${important ? 'text-red-600' : ''}`}
          >
            {label} {important ? <span className="text-red-600">*</span> : ''}
          </label>
        )}
        <Select
          styles={customStyles}
          className="  rounded border border-stroke bg-gray h-[50px] text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
          options={options}
          value={value ? { value: value, label: value } : null}
          onChange={(selectedOption) => onChange(selectedOption.value)}
          placeholder={placeholder}
        />
      </div>
    );
  };

export default CustomSelect