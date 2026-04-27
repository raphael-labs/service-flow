import React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useLanguageStore } from '@/stores/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { isValidPhone } from '@/utils/phone';

interface FormPhoneInputProps {
    label: string;
    value?: string;
    onChange: (value?: string) => void;
    error?: string;
}

const languageToCountry = {
    pt: 'BR',
    en: 'US',
    es: 'MX',
} as const;

export const FormPhoneInput: React.FC<FormPhoneInputProps> = ({
    label,
    value,
    onChange,
    error,
}) => {
    const language = useLanguageStore(s => s.language);
    const isInvalid = value && !isValidPhone(value);
    const { t } = useTranslation();

    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
                {label}
            </label>
            <div
                className={`input-base flex items-center ${error || isInvalid
                    ? 'border-destructive focus-within:ring-destructive/30'
                    : ''
                    }`}
            >
                <PhoneInput
                    defaultCountry={languageToCountry[language]}
                    value={value}
                    onChange={onChange}
                    className="w-full"
                    required
                />
            </div>
            {(error || isInvalid) && (
                <p className="text-xs text-destructive">
                    {error || t('phoneinvalid')}
                </p>
            )}
        </div>
    );
};