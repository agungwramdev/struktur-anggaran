import React from 'react';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/formatters';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  required?: boolean;
  className?: string;
}

export default function CurrencyInput({
  value,
  onChange,
  label,
  required = false,
  className = '',
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState(formatCurrencyInput(value));

  React.useEffect(() => {
    setDisplayValue(formatCurrencyInput(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseCurrencyInput(inputValue);

    setDisplayValue(formatCurrencyInput(numericValue));
    onChange(numericValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for easy editing
    e.target.select();
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          Rp
        </span>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          className="input pl-10 text-right"
          required={required}
          placeholder="0"
        />
      </div>
    </div>
  );
}
