'use client';

import React, { useRef } from 'react';

interface DateInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function DateInput({
  id,
  name,
  value,
  onChange,
  placeholder = 'DD/MM/AAAA',
  className = '',
  required = false,
  disabled = false,
}: DateInputProps) {
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  // Converte DD/MM/AAAA para YYYY-MM-DD para o seletor nativo
  const getIsoValue = (val: string): string => {
    if (!val) return '';
    const trimmed = val.trim();
    const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    return '';
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value; // YYYY-MM-DD
    if (!iso) {
      onChange('');
      return;
    }
    const [y, m, d] = iso.split('-');
    if (y && m && d) {
      onChange(`${d}/${m}/${y}`);
    } else {
      onChange(iso);
    }
  };

  const handleOpenPicker = () => {
    if (disabled) return;
    const picker = hiddenDateRef.current;
    if (picker) {
      const iso = getIsoValue(value);
      if (iso) picker.value = iso;
      try {
        if ('showPicker' in picker && typeof picker.showPicker === 'function') {
          picker.showPicker();
        } else {
          picker.focus();
          picker.click();
        }
      } catch {
        picker.click();
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    // Se o usuário está apagando
    if (next.length < value.length) {
      onChange(next);
      return;
    }
    // Se colou formato ISO YYYY-MM-DD
    const isoMatch = next.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      onChange(`${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`);
      return;
    }
    // Se contém letras (ex: 'A combinar', 'Imediato')
    if (/[a-zA-Z]/.test(next)) {
      onChange(next);
      return;
    }
    // Formatação automática de dígitos
    const digits = next.replace(/\D/g, '').slice(0, 8);
    if (!digits) {
      onChange('');
      return;
    }
    if (digits.length <= 2) {
      onChange(digits);
    } else if (digits.length <= 4) {
      onChange(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      onChange(`${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`);
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`${className} pr-11`}
      />

      {/* Botão de calendário com ícone dourado visível */}
      <button
        type="button"
        onClick={handleOpenPicker}
        disabled={disabled}
        tabIndex={-1}
        title="Abrir calendário"
        className="absolute right-2.5 p-1.5 text-[#888888] hover:text-[#f5c518] hover:bg-[#1a1a1a] rounded transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus:text-[#f5c518]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      </button>

      {/* Input nativo oculto para invocar o datepicker do SO/browser */}
      <input
        ref={hiddenDateRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handlePickerChange}
        className="sr-only absolute pointer-events-none opacity-0"
        style={{ colorScheme: 'dark' }}
      />
    </div>
  );
}
