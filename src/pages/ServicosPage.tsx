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

export default function ServicosPage() {
  const { services, loadMock, addService, removeService, updateService } = useServiceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notify = useNotification();

  useEffect(() => {
    setIsLoading(true);
    try { loadMock(); } catch { setError('Erro ao carregar serviços.'); }
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const { paginatedItems, currentPage, totalPages, totalItems, itemsPerPage, setCurrentPage } = usePagination(services, 10);

  const handleSubmit = (data: { name: string; duration: number; price: number }) => {
    if (editingService) {
      updateService(editingService, data);
      notify.success('Serviço atualizado com sucesso!');
    } else {
      addService({ ...data, id: crypto.randomUUID() });
      notify.success('Serviço adicionado com sucesso!');
    }
    setModalOpen(false);
    setEditingService(null);
  };

  const handleRemove = (id: string, name: string) => {
    removeService(id);
    notify.success(`Serviço "${name}" removido.`);
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
        <h1 className="page-header">Serviços</h1>
        <button onClick={() => { setEditingService(null); setModalOpen(true); }} className="btn-primary text-sm">
          <Plus className="w-4 h-4 mr-1.5" /> Novo Serviço
        </button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={4} rows={4} />
      ) : services.length === 0 ? (
        <div className="card-elevated">
          <EmptyState
            icon={Briefcase}
            title="Nenhum serviço cadastrado"
            description="Adicione seus serviços para começar a receber agendamentos."
            action={
              <button onClick={() => setModalOpen(true)} className="btn-primary text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Serviço
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
                  <th className="table-header text-left px-5 py-3">Serviço</th>
                  <th className="table-header text-left px-5 py-3">Duração</th>
                  <th className="table-header text-left px-5 py-3">Preço</th>
                  <th className="table-header text-right px-5 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(s => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">{s.name}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.duration} min</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">R$ {s.price.toFixed(2)}</td>
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
                ))}
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

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingService(null); }} title={editingService ? 'Editar Serviço' : 'Novo Serviço'}>
        <ServiceForm
          initialData={editData}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditingService(null); }}
        />
      </Modal>
    </div>
  );
}
