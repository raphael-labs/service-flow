import React from 'react';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <textarea ref={ref} className={`input-base min-h-[80px] ${error ? 'border-destructive' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
);
FormTextarea.displayName = 'FormTextarea';
export default FormTextarea;
