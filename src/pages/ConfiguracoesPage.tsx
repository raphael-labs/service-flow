import { useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore, type Language } from '@/stores/languageStore';
import { useBusinessImageStore, type BookingStyle } from '@/stores/businessImageStore';
import Card from '@/components/Card';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { Upload, X, Image, Check, Pencil, CirclePower } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/getEmpresaId";
import { useEffect } from 'react';
import { FormPhoneInput } from '@/components/FormPhoneInput';


export default function ConfiguracoesPage() {
  const user = useAuthStore(s => s.user);
  const { language, setLanguage } = useLanguageStore();
  const { logo, extraImage, bookingStyle, setBookingStyle, setLogo, setExtraImage } = useBusinessImageStore();
  const { t } = useTranslation();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);

  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [slug, setSlug] = useState(user?.slug || '');
  const [min_prev_hora, setMin_prev_hora] = useState(user?.min_prev_hora || '');
  const [max_agenda_dias, setMax_agenda_dias] = useState(user?.max_agenda_dias || '');

  // 🔥 MAPA DE ESTILO (BANCO)
  const styleMap: Record<BookingStyle, number> = {
    classic: 1,
    minimal: 2,
    bold: 3,
    elegant: 4,
    compact: 5,
    glass: 6,
    playful: 7,
    corporate: 8,
    modern: 9,
    warm: 10,
  };

  // 🔥 SCHEDULE POR DIA
  const [schedule, setSchedule] = useState<Record<string, {
    active: boolean;
    start: string;
    end: string;
    slot: string;
    simultaneo: string;
  }>>({
    '1': { active: true, start: '08:00', end: '18:00', slot: '30', simultaneo: '1' },
    '2': { active: true, start: '08:00', end: '18:00', slot: '30', simultaneo: '1' },
    '3': { active: true, start: '08:00', end: '18:00', slot: '30', simultaneo: '1' },
    '4': { active: true, start: '08:00', end: '18:00', slot: '30', simultaneo: '1' },
    '5': { active: true, start: '08:00', end: '18:00', slot: '30', simultaneo: '1' },
    '6': { active: true, start: '08:00', end: '18:00', slot: '30', simultaneo: '1' },
    '0': { active: false, start: '08:00', end: '18:00', slot: '30', simultaneo: '1' },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const empresaId = await getEmpresaId();

        // 🔥 EMPRESA
        const { data } = await supabase
          .from("empresas")
          .select("*")
          .eq("id", empresaId)
          .single();

        if (!data) return;

        setBusinessName(data.name || '');
        setPhone(data.telefone || '');
        setEmail(data.email || '');
        setAddress(data.endereco || '');
        setSlug(data.slug || '');
        setMin_prev_hora(data.min_prev_hora || '');
        setMax_agenda_dias(data.max_agenda_dias || '');

        if (data.idioma) setLanguage(data.idioma);

        if (data.path_img_logo) setLogo(data.path_img_logo);
        if (data.path_img_bg) setExtraImage(data.path_img_bg);

        const reverseStyleMap: Record<number, BookingStyle> = {
          1: 'classic',
          2: 'minimal',
          3: 'bold',
          4: 'elegant',
          5: 'compact',
          6: 'glass',
          7: 'playful',
          8: 'corporate',
          9: 'modern',
          10: 'warm'
        };

        if (data.pg_estilo) {
          setBookingStyle(reverseStyleMap[data.pg_estilo]);
        }

        // 🔥🔥🔥 AQUI ESTÁ O QUE FALTAVA 🔥🔥🔥

        const { data: dias } = await supabase
          .from("dias_semanais")
          .select("*")
          .eq("empresa_id", empresaId);

        // monta estrutura padrão
        const defaultSchedule = {
          '1': { active: false, start: '08:00', end: '18:00', slot: '30', simultaneo: '1' },
          '2': { active: false, start: '08:00', end: '18:00', slot: '30', simultaneo: '1' },
          '3': { active: false, start: '08:00', end: '18:00', slot: '30', simultaneo: '1' },
          '4': { active: false, start: '08:00', end: '18:00', slot: '30', simultaneo: '1' },
          '5': { active: false, start: '08:00', end: '18:00', slot: '30', simultaneo: '1' },
          '6': { active: false, start: '08:00', end: '18:00', slot: '30', simultaneo: '1' },
          '0': { active: false, start: '08:00', end: '18:00', slot: '30', simultaneo: '1' },
        };

        if (dias && dias.length > 0) {
          dias.forEach(d => {
            defaultSchedule[String(d.dia_semana)] = {
              active: true,
              start: d.hora_inicio?.slice(0, 5) || '08:00',
              end: d.hora_fim?.slice(0, 5) || '18:00',
              slot: String(d.slot_minimo || 30),
              simultaneo: String(d.serv_simultaneo || 1),
            };
          });
        }

        setSchedule(defaultSchedule);

      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, []);

  const dayKeys = [
    { value: '1', key: 'mon' },
    { value: '2', key: 'tue' },
    { value: '3', key: 'wed' },
    { value: '4', key: 'thu' },
    { value: '5', key: 'fri' },
    { value: '6', key: 'sat' },
    { value: '0', key: 'sun' },
  ];

  const updateDay = (day: string, field: string, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  // 🔥 SALVAR EMPRESA
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const empresaId = await getEmpresaId();

      await supabase
        .from("empresas")
        .update({
          name: businessName,
          telefone: phone,
          email,
          endereco: address,
          slug,
          min_prev_hora,
          max_agenda_dias
        })
        .eq("id", empresaId);

      toast.success(t('infoSaved'));

    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar");
    }
  };

  // 🔥 SALVAR AGENDA
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const empresaId = await getEmpresaId();

      await supabase
        .from("dias_semanais")
        .delete()
        .eq("empresa_id", empresaId);

      const inserts = Object.entries(schedule)
        .filter(([_, d]) => d.active)
        .map(([dia, d]) => ({
          empresa_id: empresaId,
          dia_semana: Number(dia),
          hora_inicio: d.start,
          hora_fim: d.end,
          slot_minimo: Number(d.slot),
          serv_simultaneo: Number(d.simultaneo)
        }));

      if (inserts.length > 0) {
        await supabase.from("dias_semanais").insert(inserts);
      }

      toast.success(t('scheduleSaved'));

    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar agenda");
    }
  };

  // 🔥 UPLOAD 
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "bg"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max 2MB");
      return;
    }

    try {
      const empresaId = await getEmpresaId();

      // 🔥 define caminho fixo
      const filePath = `${empresaId}/${type}.png`;

      // 🔥 tenta deletar imagem antiga (se existir)
      await supabase.storage
        .from("imagens")
        .remove([filePath]);

      // 🔥 upload novo arquivo
      const { error: uploadError } = await supabase.storage
        .from("imagens")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 🔥 URL pública
      const { data } = supabase.storage
        .from("imagens")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // 🔥 salva no banco
      const field =
        type === "logo" ? "path_img_logo" : "path_img_bg";

      await supabase
        .from("empresas")
        .update({ [field]: publicUrl })
        .eq("id", empresaId);

      // 🔥 atualiza UI
      if (type === "logo") setLogo(publicUrl);
      else setExtraImage(publicUrl);

      toast.success(t("imageSaved"));

    } catch (err) {
      console.error(err);
      toast.error("Erro ao fazer upload");
    }

    e.target.value = "";
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="page-header">{t('settings')}</h1>

      {/* LANGUAGE */}
      <Card>
        <FormSelect
          label={t('language')}
          value={language}
          onChange={async e => {
            const value = e.target.value as Language;
            setLanguage(value);

            try {
              const empresaId = await getEmpresaId();

              await supabase
                .from("empresas")
                .update({ idioma: value })
                .eq("id", empresaId);

            } catch (err) {
              console.error(err);
            }
          }}
          options={[
            { value: 'pt', label: 'Português' },
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
          ]}
        />
      </Card>

      {/* Business Images */}
      <Card>
        <h2 className="text-base font-semibold font-heading text-foreground mb-4">{t('businessImages')}</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Logo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('logo')}</label>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "logo")} />
            {logo ? (
              <div className="relative group">
                <div className="w-full aspect-square rounded-xl border border-border bg-card overflow-hidden flex items-center justify-center">
                  <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => { setLogo(null); toast.success(t('imageRemoved')); }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card flex flex-col items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Upload className="w-6 h-6" />
                <span className="text-xs">{t('uploadImage')}</span>
              </button>
            )}
          </div>

          {/* Extra Image */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('extraImage')}</label>
            <input ref={extraInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "bg")} />
            {extraImage ? (
              <div className="relative group">
                <div className="w-full aspect-square rounded-xl border border-border bg-card overflow-hidden flex items-center justify-center">
                  <img src={extraImage} alt="Extra" className="max-w-full max-h-full object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => { setExtraImage(null); toast.success(t('imageRemoved')); }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => extraInputRef.current?.click()}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card flex flex-col items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Image className="w-6 h-6" />
                <span className="text-xs">{t('uploadImage')}</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Booking Page Style */}
      <Card>
        <h2 className="text-base font-semibold font-heading text-foreground mb-4">{t('bookingPageStyle')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {([
            { id: 'classic', label: 'Classic', desc: t('styleClassicDesc'), color: 'bg-primary' },
            { id: 'minimal', label: 'Minimal', desc: t('styleMinimalDesc'), color: 'bg-foreground' },
            { id: 'bold', label: 'Bold', desc: t('styleBoldDesc'), color: 'bg-primary' },
            { id: 'elegant', label: 'Elegant', desc: t('styleElegantDesc'), color: 'bg-accent' },
            { id: 'compact', label: 'Compact', desc: t('styleCompactDesc'), color: 'bg-secondary' },
            { id: 'glass', label: 'Glass', desc: t('styleGlassDesc'), color: 'bg-primary/30' },
            { id: 'playful', label: 'Playful', desc: t('stylePlayfulDesc'), color: 'bg-warning' },
            { id: 'corporate', label: 'Corporate', desc: t('styleCorporateDesc'), color: 'bg-primary' },
            { id: 'modern', label: 'Modern', desc: t('styleModernDesc'), color: 'bg-accent' },
            { id: 'warm', label: 'Warm', desc: t('styleWarmDesc'), color: 'bg-warning/30' },
          ] as { id: BookingStyle; label: string; desc: string; color: string }[]).map(style => (
            <button
              key={style.id}
              type="button"
              onClick={async () => {
                setBookingStyle(style.id); // mantém comportamento atual
                try {
                  const empresaId = await getEmpresaId();
                  const styleMap: Record<string, number> = {
                    classic: 1,
                    minimal: 2,
                    bold: 3,
                    elegant: 4,
                    compact: 5,
                    glass: 6,
                    playful: 7,
                    corporate: 8,
                    modern: 9,
                    warm: 10
                  };

                  await supabase
                    .from("empresas")
                    .update({ pg_estilo: styleMap[style.id] })
                    .eq("id", empresaId);

                  toast.success(t('styleSaved'));

                } catch (err) {
                  console.error(err);
                  toast.error("Erro ao salvar estilo");
                }
              }}
              className={`relative rounded-xl border-2 p-3 text-left transition-all hover:shadow-md ${bookingStyle === style.id ? 'border-primary shadow-md' : 'border-border hover:border-primary/30'
                }`}
            >
              {bookingStyle === style.id && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className={`w-full h-8 rounded-lg mb-2 ${style.color}`} />
              <p className="text-xs font-semibold text-foreground">{style.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{style.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* BUSINESS INFO */}
      <Card>
        <h2 className="text-base font-semibold font-heading text-foreground mb-4">Configurações Gerais</h2>
        <form onSubmit={handleSaveBusiness} className="space-y-4">
          <FormInput required label={t('companyName')} value={businessName} onChange={e => setBusinessName(e.target.value)} />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormPhoneInput
              label={t('phone')}
              value={phone}
              onChange={setPhone}
            />
            <FormInput required label={t('email')} value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <FormInput label={t('address')} value={address} onChange={e => setAddress(e.target.value)} />
          <FormInput required label='Slug' value={slug} onChange={e => setSlug(e.target.value)} />

          <div className="grid sm:grid-cols-2 gap-4">
            <FormInput required type="number" min="0" label='Antecedencia minima (Horas)' value={min_prev_hora} onChange={e => setMin_prev_hora(e.target.value)} />
            <FormInput required type="number" min="7" max="120"  label='Disponibilidade maxima (Dias)' value={max_agenda_dias} onChange={e => setMax_agenda_dias(e.target.value)} />
          </div>

          <button className="btn-primary">{t('saveInfo')}</button>
        </form>
      </Card>

      {/* SCHEDULE */}
      <Card>
        <h2 className="text-base font-semibold font-heading text-foreground mb-4">{t('scheduleConfig')}</h2>

        {/* Public link info */}
        <div className="bg-accent/50 rounded-lg p-4 mb-6">
          <p className="text-xs font-medium text-foreground mb-1">{t('publicBookingLink')}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-card rounded px-3 py-2 text-muted-foreground border border-border truncate">
              {window.location.origin}/booking/{slug || 'seu-negocio'}
            </code>
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/booking/${slug}`); toast.success(t('linkCopied')); }}
              className="btn-outline text-xs px-3 py-2 shrink-0"
            >
              {t('copy')}
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveSchedule} className="space-y-4">

          {dayKeys.map(day => {
            const d = schedule[day.value];

            return (
              <div key={day.value} className="border p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>{t(day.key)}</span>
                  <button className="btn-outline text-xs px-3 py-2 shrink-0 flex items-center gap-1.5" type="button" onClick={() => updateDay(day.value, 'active', !d.active)}>
                    <CirclePower className={`w-3.5 h-3.5 ${d.active ? 'text-green-500' : 'text-red-500'}`} /> {d.active ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
                {d.active && (
                  <div className="grid sm:grid-cols-4 gap-3">
                    <FormInput label="Início" type="time" value={d.start} onChange={e => updateDay(day.value, 'start', e.target.value)} />
                    <FormInput label="Fim" type="time" value={d.end} onChange={e => updateDay(day.value, 'end', e.target.value)} />
                    <FormInput label="Slot (minutos)" type="number" value={d.slot} onChange={e => updateDay(day.value, 'slot', e.target.value)} />
                    <FormInput
                      label="Simultâneos"
                      type="number"
                      value={d.simultaneo}
                      onChange={e => updateDay(day.value, 'simultaneo', e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
          <button className="btn-primary">{t('saveSchedule')}</button>
        </form>
      </Card>
    </div>
  );
}