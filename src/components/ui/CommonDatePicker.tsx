'use client';
import React from 'react';
import { DatePicker, DatePickerProps } from 'rsuite';
// Only load RSuite CSS when a date tool mounts — never block homepage/tool LCP globally.
import 'rsuite/dist/rsuite-no-reset.min.css';

type CommonDatePickerProps = Omit<
  DatePickerProps,
  'value' | 'onChange' | 'format' | 'oneTap' | 'cleanable' | 'size' | 'block'
> & {
  value: Date | null;
  onChange: (value: Date | null) => void;
  placeholder?: string;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
};

const isValidDate = (value: unknown): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime());

const CommonDatePicker: React.FC<CommonDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  format = 'MMM d, yyyy',
  minDate,
  maxDate,
  shouldDisableDate,
  ...props
}) => {
  return (
    <DatePicker
      className="rsuite-date-picker"
      block
      size="lg"
      oneTap
      cleanable={false}
      value={value}
      onChange={(nextValue) => {
        if (nextValue === null) {
          onChange(null);
          return;
        }
        if (isValidDate(nextValue)) {
          onChange(nextValue);
        }
      }}
      format={format}
      placeholder={placeholder}
      shouldDisableDate={(date) => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        if (shouldDisableDate) return shouldDisableDate(date);
        return false;
      }}
      {...props}
    />
  );
};

export default CommonDatePicker;
