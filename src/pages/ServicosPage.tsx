import { useEffect, useState } from 'react';
import { useServiceStore } from '@/stores/serviceStore';
import Modal from '@/components/Modal';
import ServiceForm from '@/components/ServiceForm';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function ServicosPage() {
  const { services, loadMock, addService, removeService, updateService } = useServiceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);

  useEffect(() => { loadMock(); }, []);

  const handleSubmit = (data: { name: string; duration: number; price: number }) => {
    if (editingService) {
      updateService(editingService, data);
    } else {
      addService({ ...data, id: crypto.randomUUID() });
    }
    setModalOpen(false);
    setEditingService(null);
  };

  const openEdit = (id: string) => {
    setEditingService(id);
    setModalOpen(true);
  };

  const editData = editingService ? services.find(s => s.id === editingService) : undefined;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-header">Serviços</h1>
        <button onClick={() => { setEditingService(null); setModalOpen(true); }} className="btn-primary text-sm">
          <Plus className="w-4 h-4 mr-1.5" /> Novo Serviço
        </button>
      </div>

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
              {services.map(s => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-foreground">{s.name}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.duration} min</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">R$ {s.price.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s.id)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => removeService(s.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum serviço cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
