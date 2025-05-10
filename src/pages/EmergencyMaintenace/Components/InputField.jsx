import React from 'react'

export const InputField = ({
    label,
    name,
    id,
    placeholder,
    value,
    onChange,
    disabled,
    className = '',
    important,
    type,
  }) => {
    return (
      <div className={`w-full  ${className}`}>
        <label
          className={` mb-3 block text-md font-medium text-black dark:text-white ${important ? 'text-red-600' : ''}`}
          htmlFor={id}
        >
          {label}
          {important ? <span className="text-red-600">*</span> : ''}
        </label>
        <div className="relative">
          <input
            className={` w-full rounded border   py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary ${disabled ? 'uneditable  border-stroke' : 'bg-gray border-stroke'}`}
            type={type}
            name={name}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>
    );
  };

export default InputField