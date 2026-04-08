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
import { supabase } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/getEmpresaId";

export default function ServicosPage() {
  const { services } = useServiceStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const notify = useNotification();
  const { t } = useTranslation();

  // 🔥 LOAD SERVIÇOS
  const loadServices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const empresaId = await getEmpresaId();

      const { data, error } = await supabase
        .from("servicos")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 🔥 NORMALIZA CAMPOS
      useServiceStore.setState({
        services: (data || []).map(s => ({
          ...s,
          description: s.descricao,
          duration: s.duracao,
          price: s.preco,
          currency: s.moeda,
          simultaneousSlots: s.simultaneo
        }))
      });

    } catch (err) {
      console.error(err);
      setError(t('errorLoadingServices'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const { paginatedItems, currentPage, totalPages, totalItems, itemsPerPage, setCurrentPage } =
    usePagination(services, 10);

  // 🔥 SUBMIT
  const handleSubmit = async (data: {
    name: string;
    description?: string;
    duration: number;
    price?: number;
    currency: string;
    simultaneousSlots: number;
  }) => {
    try {
      const empresaId = await getEmpresaId();

      if (editingService) {
        await supabase
          .from("servicos")
          .update({
            name: data.name,
            descricao: data.description,
            duracao: data.duration,
            preco: data.price,
            moeda: data.currency,
            simultaneo: data.simultaneousSlots
          })
          .eq("id", editingService);

        notify.success(t('serviceUpdated'));
      } else {
        await supabase
          .from("servicos")
          .insert({
            name: data.name,
            descricao: data.description,
            duracao: data.duration,
            preco: data.price,
            moeda: data.currency,
            simultaneo: data.simultaneousSlots,
            empresa_id: empresaId
          });

        notify.success(t('serviceAdded'));
      }

      await loadServices();
      setModalOpen(false);
      setEditingService(null);

    } catch (err) {
      console.error(err);
      notify.error("Erro ao salvar serviço");
    }
  };

  // 🔥 DELETE
  const handleRemove = async (id: string, name: string) => {
    await supabase.from("servicos").delete().eq("id", id);
    notify.success(t('serviceRemoved', { name }));
    await loadServices();
  };

  const openEdit = (id: string) => {
    setEditingService(id);
    setModalOpen(true);
  };

  // 🔥 EDIT DATA (resolve descricao vs description)
  const editData = editingService
    ? (() => {
      const s = services.find(s => s.id === editingService);
      if (!s) return undefined;

      return {
        name: s.name,
        description: s.description || s.descricao || '',
        duration: s.duration,
        price: s.price,
        currency: s.currency,
        simultaneousSlots: s.simultaneousSlots
      };
    })()
    : undefined;

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadServices}
      />
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-header">{t('services')}</h1>
        <button
          onClick={() => {
            setEditingService(null);
            setModalOpen(true);
          }}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> {t('newService')}
        </button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={5} rows={4} />
      ) : services.length === 0 ? (
        <div className="card-elevated">
          <EmptyState
            icon={Briefcase}
            title={t('noServices')}
            description={t('noServicesDesc')}
            action={
              <button
                onClick={() => setModalOpen(true)}
                className="btn-primary text-xs"
              >
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
                  const symbol =
                    s.currency === 'USD'
                      ? 'US$'
                      : s.currency === 'EUR'
                        ? '€'
                        : 'R$';

                  return (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground">{s.name}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground max-w-[200px] truncate">
                        {s.description || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.duration} min</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {s.price != null ? `${symbol} ${s.price.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.simultaneousSlots}</td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(s.id)}
                            className="p-1.5 rounded-lg hover:bg-accent"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleRemove(s.id, s.name)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10"
                          >
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

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingService(null);
        }}
        title={editingService ? t('editService') : t('newService')}
      >
        <ServiceForm
          initialData={editData}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingService(null);
          }}
        />
      </Modal>
    </div>
  );
}