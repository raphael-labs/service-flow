import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <input ref={ref} className={`input-base ${error ? 'border-destructive focus:ring-destructive/30' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
);
FormInput.displayName = 'FormInput';
export default FormInput;
