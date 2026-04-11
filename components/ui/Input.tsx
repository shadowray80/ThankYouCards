'use client';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string | number;
}

export function Input({ value, onChange, placeholder, type = 'text', min }: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      style={{ width: '100%', border: '2px solid #E8E2F0', borderRadius: 12, padding: '11px 14px', fontFamily: "'Nunito',sans-serif", fontSize: '.94rem', fontWeight: 600, color: '#2A2A2A', background: '#fff', outline: 'none', transition: 'border-color .2s' }}
    />
  );
}
