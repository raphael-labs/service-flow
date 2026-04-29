import { useState } from 'react';
import { Trash2, X, Search } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';

interface Appointment {
    id: string;
    serviceName: string;
    date: string;
    time: string;
}

export default function FloatingCancelAppointment() {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const { slug } = useParams();
    const { t, locale } = useTranslation();
    const [cancelId, setCancelId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');

    // 🔍 BUSCAR AGENDAMENTOS
    const handleSearch = async () => {
        if (!email || !birthDate) {
            toast.error(t('fillAllFields'));
            return;
        }
        if (!slug) {
            toast.error(t('errorCompanyNotFound'));
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/get-client-appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, email, data_nascimento: birthDate }),
            });
            const data = await res.json();
            if (!res.ok) {
                console.error(data);
                toast.error(t('errorSearch'));
                return;
            }
            const lista = data.agendamentos || [];
            const formatted = lista.map((a: any) => {
                const d = new Date(a.data_hora);
                return {
                    id: a.id,
                    serviceName: a.servicos?.name || 'Service',
                    date: d.toLocaleDateString(),
                    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
            });
            setAppointments(formatted);
        } catch (err) {
            console.error(err);
            toast.error(t('errorFindingAppointments'));
        }
        setLoading(false);
    };

    // ❌ CANCELAR
    const handleCancelClick = (id: string) => {
        setCancelId(id);
        setCancelReason('');
    };

    const confirmCancel = async () => {
        if (!cancelId) return;
        if (!cancelReason) {
            toast.error(t('fillAllFields'));
            return;
        }
        try {
            await fetch('/api/cancel-appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agendamento_id: cancelId,
                    motivo: cancelReason
                }),
            });
            setAppointments(prev => prev.filter(a => a.id !== cancelId));
            toast.success(t('appointmentCanceled'));
            setCancelId(null);
            setCancelReason('');
        } catch (err) {
            console.error(err);
            toast.error(t('errorCancelingAppointment'));
        }
    };

    return (
        <>
            {/* BOTÃO FLUTUANTE */}
            <button
                onClick={() => setOpen(true)}
                className="fixed top-4 right-4 z-50 bg-destructive text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:scale-105 transition"
            >
                <Trash2 className="w-4 h-4" />
                {t('cancelAppointment')}
            </button>

            {/* MODAL */}
            {open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-card rounded-xl w-full max-w-md p-5 relative shadow-lg">
                        {/* fechar */}
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-3 right-3"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-bold mb-4">
                            {t('findAppointments')}
                        </h2>
                        {/* FORM */}
                        <div className="space-y-3">
                            <FormInput
                                label={t('email')}
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                            <FormInput
                                label={t('birthDate')}
                                type="date"
                                value={birthDate}
                                onChange={e => setBirthDate(e.target.value)}
                                required
                            />
                            <button
                                onClick={handleSearch}
                                className="w-full bg-primary text-white py-2 rounded-lg flex items-center justify-center gap-2"
                            >
                                <Search className="w-4 h-4" />
                                {loading ? t('finding') : t('find')}
                            </button>
                        </div>
                        {/* RESULTADOS */}
                        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                            {appointments.length === 0 && !loading && (
                                <p className="text-sm text-muted-foreground text-center">
                                    {t('noAppointments')}
                                </p>
                            )}
                            {appointments.map(a => (
                                <div
                                    key={a.id}
                                    className="border rounded-lg p-3 flex justify-between items-center"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{a.serviceName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {a.date} • {a.time}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleCancelClick(a.id)}
                                        className="text-destructive hover:scale-110 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {cancelId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-4">
                    <div className="bg-card rounded-xl w-full max-w-sm p-5 shadow-lg">
                        <h3 className="text-lg font-semibold mb-3">
                            {t('cancelAppointment')}
                        </h3>
                        <FormTextarea
                            label={t('cancelReason')}
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            placeholder={t('cancelReason')}
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setCancelId(null)}
                                className="px-3 py-2 rounded-lg border"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="px-3 py-2 rounded-lg bg-destructive text-white"
                            >
                                {t('confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}