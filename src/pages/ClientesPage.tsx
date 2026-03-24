import { useEffect, useState } from 'react';
import { useClientStore } from '@/stores/clientStore';
import Modal from '@/components/Modal';
import ClientForm from '@/components/ClientForm';
import TableSkeleton from '@/components/TableSkeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import DataPagination from '@/components/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { useNotification } from '@/hooks/useNotification';
import { Pencil, Trash2, Plus, Search, Users } from 'lucide-react';

export default function ClientesPage() {
  const { clients, loadMock, addClient, removeClient, updateClient } = useClientStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notify = useNotification();

  useEffect(() => {
    setIsLoading(true);
    try {
      loadMock();
    } catch {
      setError('Erro ao carregar clientes.');
    }
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedItems, currentPage, totalPages, totalItems, itemsPerPage, setCurrentPage } = usePagination(filtered, 10);

  const handleSubmit = (data: { name: string; phone: string; email: string }) => {
    if (editingClient) {
      updateClient(editingClient, data);
      notify.success('Cliente atualizado com sucesso!');
    } else {
      addClient({ ...data, id: crypto.randomUUID() });
      notify.success('Cliente adicionado com sucesso!');
    }
    setModalOpen(false);
    setEditingClient(null);
  };

  const handleRemove = (id: string, name: string) => {
    removeClient(id);
    notify.success(`Cliente "${name}" removido.`);
  };

  const openEdit = (id: string) => {
    setEditingClient(id);
    setModalOpen(true);
  };

  const editData = editingClient ? clients.find(c => c.id === editingClient) : undefined;

  if (error) return <ErrorState message={error} onRetry={() => { setError(null); loadMock(); setIsLoading(false); }} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-header">Clientes</h1>
        <button onClick={() => { setEditingClient(null); setModalOpen(true); }} className="btn-primary text-sm">
          <Plus className="w-4 h-4 mr-1.5" /> Novo Cliente
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="input-base pl-9"
          placeholder="Buscar clientes..."
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {isLoading ? (
        <TableSkeleton columns={4} rows={5} />
      ) : clients.length === 0 ? (
        <div className="card-elevated">
          <EmptyState
            icon={Users}
            title="Nenhum cliente cadastrado"
            description="Adicione seu primeiro cliente para começar a agendar serviços."
            action={
              <button onClick={() => setModalOpen(true)} className="btn-primary text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Cliente
              </button>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-elevated">
          <EmptyState
            icon={Search}
            title="Nenhum resultado"
            description={`Nenhum cliente encontrado para "${search}".`}
          />
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="table-header text-left px-5 py-3">Nome</th>
                  <th className="table-header text-left px-5 py-3">Telefone</th>
                  <th className="table-header text-left px-5 py-3 hidden sm:table-cell">Email</th>
                  <th className="table-header text-right px-5 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(c => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">{c.name}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{c.phone}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground hidden sm:table-cell">{c.email}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c.id)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleRemove(c.id, c.name)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
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

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingClient(null); }} title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}>
        <ClientForm
          initialData={editData}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditingClient(null); }}
        />
      </Modal>
    </div>
  );
}
