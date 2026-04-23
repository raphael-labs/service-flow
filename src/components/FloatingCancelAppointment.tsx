import { useState } from 'react';
import { Trash2, X, Search } from 'lucide-react';
import { useParams } from 'react-router-dom';

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

    // 🔍 BUSCAR AGENDAMENTOS
    const handleSearch = async () => {
        if (!email || !birthDate) return alert('Preencha todos os campos');

        if (!slug) {
            return alert('Erro: empresa não identificada');
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
                alert(data.error || 'Erro ao buscar');
                return;
            }

            const lista = data.agendamentos || [];

            const formatted = lista.map((a: any) => {
                const d = new Date(a.data_hora);

                return {
                    id: a.id,
                    serviceName: a.servicos?.name || 'Serviço',
                    date: d.toLocaleDateString(),
                    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
            });

            setAppointments(formatted);
        } catch (err) {
            console.error(err);
            alert('Erro ao buscar agendamentos');
        }

        setLoading(false);
    };

    // ❌ CANCELAR
    const handleCancel = async (id: string) => {
        const reason = prompt('Digite o motivo do cancelamento:');
        if (!reason) return;

        try {
            console.log({ id, reason });
            await fetch('/api/cancel-appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, motivo: reason }),
            });

            setAppointments(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error(err);
            alert('Erro ao cancelar');
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
                Cancelar agendamento
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
                            Buscar agendamentos
                        </h2>

                        {/* FORM */}
                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="Seu email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2"
                            />

                            <input
                                type="date"
                                value={birthDate}
                                onChange={e => setBirthDate(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2"
                            />

                            <button
                                onClick={handleSearch}
                                className="w-full bg-primary text-white py-2 rounded-lg flex items-center justify-center gap-2"
                            >
                                <Search className="w-4 h-4" />
                                {loading ? 'Buscando...' : 'Buscar'}
                            </button>
                        </div>

                        {/* RESULTADOS */}
                        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                            {appointments.length === 0 && !loading && (
                                <p className="text-sm text-muted-foreground text-center">
                                    Nenhum agendamento encontrado
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
                                        onClick={() => handleCancel(a.id)}
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
        </>
    );
}