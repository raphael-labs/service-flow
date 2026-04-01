import { useEffect, useState } from 'react';
import { useServiceStore } from '@/stores/serviceStore';
import Modal from '@/components/Modal';
import ServiceForm from '@/components/ServiceForm';
import TableSkeleton from '@/components/TableSkeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import DataPagination from '@/components/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { useNotification } from '@/hooks/useNotification';
import { Pencil, Trash2, Plus, Briefcase } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function ServicosPage() {
  const { services, loadMock, addService, removeService, updateService } = useServiceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notify = useNotification();
  const { t } = useTranslation();

  useEffect(() => {
    setIsLoading(true);
    try { loadMock(); } catch { setError(t('errorLoadingServices')); }
    const ti = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(ti);
  }, []);

  const { paginatedItems, currentPage, totalPages, totalItems, itemsPerPage, setCurrentPage } = usePagination(services, 10);

  const handleSubmit = (data: { name: string; description?: string; duration: number; price?: number; currency: import('@/types').Currency; simultaneousSlots: number }) => {
    if (editingService) {
      updateService(editingService, data);
      notify.success(t('serviceUpdated'));
    } else {
      addService({ ...data, id: crypto.randomUUID() });
      notify.success(t('serviceAdded'));
    }
    setModalOpen(false);
    setEditingService(null);
  };

  const handleRemove = (id: string, name: string) => {
    removeService(id);
    notify.success(t('serviceRemoved', { name }));
  };

  const openEdit = (id: string) => {
    setEditingService(id);
    setModalOpen(true);
  };

  const editData = editingService ? services.find(s => s.id === editingService) : undefined;

  if (error) return <ErrorState message={error} onRetry={() => { setError(null); loadMock(); setIsLoading(false); }} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-header">{t('services')}</h1>
        <button onClick={() => { setEditingService(null); setModalOpen(true); }} className="btn-primary text-sm">
          <Plus className="w-4 h-4 mr-1.5" /> {t('newService')}
        </button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={4} rows={4} />
      ) : services.length === 0 ? (
        <div className="card-elevated">
          <EmptyState
            icon={Briefcase}
            title={t('noServices')}
            description={t('noServicesDesc')}
            action={
              <button onClick={() => setModalOpen(true)} className="btn-primary text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> {t('addService')}
              </button>
            }
          />
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="table-header text-left px-5 py-3">{t('service')}</th>
                  <th className="table-header text-left px-5 py-3">{t('description')}</th>
                  <th className="table-header text-left px-5 py-3">{t('duration')}</th>
                  <th className="table-header text-left px-5 py-3">{t('price')}</th>
                  <th className="table-header text-left px-5 py-3">{t('simultaneous')}</th>
                  <th className="table-header text-right px-5 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(s => {
                  const symbol = s.currency === 'USD' ? 'US$' : s.currency === 'EUR' ? '€' : 'R$';
                  return (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">{s.name}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.duration} min</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.price != null ? `${symbol} ${s.price.toFixed(2)}` : '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.simultaneousSlots}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s.id)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleRemove(s.id, s.name)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <DataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingService(null); }} title={editingService ? t('editService') : t('newService')}>
        <ServiceForm
          initialData={editData}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditingService(null); }}
        />
      </Modal>
    </div>
  );
}
