import { useState } from 'react';

export const usePhoneMask = (initialValue = '') => {
  const [phone, setPhone] = useState(initialValue);

  const formatWithCode = (digits) => {
    const cleanDigits = digits.slice(0, 10);

    let formatted = '+7';

    if (cleanDigits.length > 0) {
      formatted += ' (' + cleanDigits.slice(0, 3);
    }
    if (cleanDigits.length >= 3) {
      formatted += ') ' + cleanDigits.slice(3, 6);
    }
    if (cleanDigits.length >= 6) {
      formatted += '-' + cleanDigits.slice(6, 8);
    }
    if (cleanDigits.length >= 8) {
      formatted += '-' + cleanDigits.slice(8, 10);
    }

    return formatted;
  };

  const handleChange = (e) => {
    const value = e.target.value;

    if (value === '') {
      setPhone('+7');
      return;
    }

    if (value.length < phone.length) {
      if (value.length <= 2) {
        setPhone('+7');
        return;
      }
      setPhone(value);
      return;
    }

    const inputDigits = value.replace(/\D/g, '');

    let cleanDigits = inputDigits;
    if (inputDigits.startsWith('7') || inputDigits.startsWith('8')) {
      cleanDigits = inputDigits.slice(1);
    }

    const formatted = formatWithCode(cleanDigits);
    setPhone(formatted);
  };

  const handleFocus = (e) => {
    e.target.setSelectionRange(3, e.target.value.length);
  };

  const getCleanPhone = () => {
    return '+7' + phone.replace(/\D/g, '').slice(1);
  };

  return { phone, setPhone, handleChange, handleFocus, getCleanPhone };
};
