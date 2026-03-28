import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-3 rounded-full bg-destructive/10 mb-4">
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{t('error')}</h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-4">{message || t('errorLoadingData')}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline text-xs">
          {t('tryAgain')}
        </button>
      )}
    </div>
  );
}
