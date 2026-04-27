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
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/getEmpresaId";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { isValidPhone } from '@/utils/phone';


export function formatPhoneDisplay(phone?: string | null) {
  if (!phone) return '';

  try {
    const phoneNumber = parsePhoneNumberFromString(phone);
    return phoneNumber ? phoneNumber.formatInternational() : phone;
  } catch {
    console.log('Error parsing phone number:', phone);
    return phone;
  }
}

export default function ClientesPage() {
  const { clients } = useClientStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const notify = useNotification();
  const { t } = useTranslation();

  // 🔥 LOAD (substitui loadMock)
  const loadClients = async () => {
    setIsLoading(true);

    try {
      const empresaId = await getEmpresaId();

      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("name", { ascending: true });

      if (error) throw error;

      useClientStore.setState({ clients: data || [] });

    } catch {
      setError(t('errorLoadingClients'));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  // 🔍 FILTRO (mantido)
  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const { paginatedItems, currentPage, totalPages, totalItems, itemsPerPage, setCurrentPage } =
    usePagination(filtered, 10);

  // 🔥 CREATE / UPDATE
  const handleSubmit = async (data: {
    name: string;
    phone: string;
    email: string;
    data_nascimento: string;
  }) => {

    if (!data.name || !data.phone || !data.email || !data.data_nascimento) {
      notify.error(t('fillAllFields'));
      return;
    }
    if (!isValidPhone(data.phone)) {
      notify.error(t('phoneinvalid'));
      return;
    }
    try {
      const empresaId = await getEmpresaId();
      if (editingClient) {
        await supabase
          .from("clientes")
          .update({
            name: data.name,
            telefone: data.phone,
            email: data.email,
            data_nascimento: data.data_nascimento
          })
          .eq("id", editingClient);

        notify.success(t('clientUpdated'));
      } else {
        await supabase
          .from("clientes")
          .insert({
            name: data.name,
            telefone: data.phone,
            email: data.email,
            data_nascimento: data.data_nascimento,
            empresa_id: empresaId
          });
        notify.success(t('clientAdded'));
      }
      await loadClients();
      setModalOpen(false);
      setEditingClient(null);
    } catch (err) {
      console.error(err);
      notify.error("Erro ao salvar cliente");
    }
  };

  // 🔥 DELETE
  const handleRemove = async (id: string, name: string) => {
    await supabase.from("clientes").delete().eq("id", id);
    notify.success(t('clientRemoved', { name }));
    await loadClients();
  };

  const openEdit = (id: string) => {
    setEditingClient(id);
    setModalOpen(true);
  };

  const editData = editingClient
    ? (() => {
      const c = clients.find(c => c.id === editingClient);
      if (!c) return undefined;

      return {
        name: c.name,
        phone: c.phone || c.telefone || '', // 🔥 aqui resolve
        email: c.email,
        data_nascimento: c.data_nascimento
      };
    })()
    : undefined;

  // 🔥 ERRO (mantido padrão)
  if (error)
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError(null);
          loadClients();
        }}
      />
    );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-header">{t('clients')}</h1>

        <button
          onClick={() => {
            setEditingClient(null);
            setModalOpen(true);
          }}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> {t('newClient')}
        </button>
      </div>

      {/* 🔍 SEARCH (mantido) */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

        <input
          className="input-base pl-9"
          placeholder={t('searchClients')}
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <TableSkeleton columns={5} rows={5} />
      ) : clients.length === 0 ? (
        <div className="card-elevated">
          <EmptyState
            icon={Users}
            title={t('noClients')}
            description={t('noClientsDesc')}
            action={
              <button
                onClick={() => setModalOpen(true)}
                className="btn-primary text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> {t('addClient')}
              </button>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-elevated">
          <EmptyState
            icon={Search}
            title={t('noResults')}
            description={`${t('noResultsFor')} "${search}".`}
          />
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="table-header text-left px-5 py-3">{t('name')}</th>
                  <th className="table-header text-left px-5 py-3">{t('phone')}</th>
                  <th className="table-header text-left px-5 py-3 hidden sm:table-cell">{t('email')}</th>
                  <th className="table-header text-left px-5 py-3">{t('birthDate')}</th>
                  <th className="table-header text-right px-5 py-3">{t('actions')}</th>
                </tr>
              </thead>

              <tbody>
                {paginatedItems.map(c => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">{c.name}</td>

                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{formatPhoneDisplay(c.telefone)}</td>

                    <td className="px-5 py-3.5 text-sm text-muted-foreground hidden sm:table-cell">{c.email}</td>

                    {/* 🎂 NOVO CAMPO */}
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {c.data_nascimento
                        ? new Date(c.data_nascimento + "T00:00:00").toLocaleDateString('pt-BR')
                        : '-'}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c.id)}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleRemove(c.id, c.name)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
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

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingClient(null);
        }}
        title={editingClient ? t('editClient') : t('newClient')}
      >
        <ClientForm
          initialData={editData}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingClient(null);
          }}
        />
      </Modal>
    </div>
  );
}