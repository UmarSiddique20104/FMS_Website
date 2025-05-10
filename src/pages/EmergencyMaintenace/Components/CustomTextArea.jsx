import React from 'react'

export const CustomTextArea = ({
    label,
    value,
    onChange,
    placeholder = '',
    rows = 4,
    className = '',
  }) => {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="mb-3 block text-md font-medium text-black dark:text-white">
            {label}
          </label>
        )}
        <textarea
          className="w-full rounded border border-stroke bg-gray p-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      </div>
    );
  };

export default CustomTextArea