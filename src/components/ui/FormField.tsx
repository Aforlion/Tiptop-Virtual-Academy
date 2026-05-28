import React from 'react';

type BaseProps = {
  label: string;
  id: string;
  options?: { value: string; label: string }[];
};

type FormFieldProps = BaseProps & (
  | ({ as?: 'input'; type?: string } & Omit<React.ComponentPropsWithoutRef<'input'>, 'id'>)
  | ({ as: 'select' } & Omit<React.ComponentPropsWithoutRef<'select'>, 'id'>)
  | ({ as: 'textarea' } & Omit<React.ComponentPropsWithoutRef<'textarea'>, 'id'>)
);

export default function FormField({ 
  label, 
  id, 
  options = [], 
  as = 'input', 
  className = '',
  ...props 
}: FormFieldProps) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      
      {as === 'select' && (
        <select 
          id={id} 
          className={`form-select ${className}`}
          {...(props as React.ComponentPropsWithoutRef<'select'>)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {as === 'textarea' && (
        <textarea 
          id={id} 
          className={`form-input ${className}`}
          style={{ minHeight: '100px', resize: 'vertical' }}
          {...(props as React.ComponentPropsWithoutRef<'textarea'>)}
        />
      )}

      {as === 'input' && (
        <input 
          id={id} 
          className={`form-input ${className}`}
          {...(props as React.ComponentPropsWithoutRef<'input'>)}
        />
      )}
    </div>
  );
}
