import React from 'react';

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: '#2A2A2A', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
