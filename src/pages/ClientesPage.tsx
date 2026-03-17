import { useEffect, useState } from 'react';
import { useClientStore } from '@/stores/clientStore';
import Modal from '@/components/Modal';
import ClientForm from '@/components/ClientForm';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';

export default function ClientesPage() {
  const { clients, loadMock, addClient, removeClient, updateClient } = useClientStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { loadMock(); }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (data: { name: string; phone: string; email: string }) => {
    if (editingClient) {
      updateClient(editingClient, data);
    } else {
      addClient({ ...data, id: crypto.randomUUID() });
    }
    setModalOpen(false);
    setEditingClient(null);
  };

  const openEdit = (id: string) => {
    setEditingClient(id);
    setModalOpen(true);
  };

  const editData = editingClient ? clients.find(c => c.id === editingClient) : undefined;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-header">Clientes</h1>
        <button onClick={() => { setEditingClient(null); setModalOpen(true); }} className="btn-primary text-sm">
          <Plus className="w-4 h-4 mr-1.5" /> Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="input-base pl-9"
          placeholder="Buscar clientes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
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
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-foreground">{c.name}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{c.phone}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground hidden sm:table-cell">{c.email}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c.id)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => removeClient(c.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum cliente encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
