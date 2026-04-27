import FormInput from '@/components/FormInput';
import { Calendar, Clock, CheckCircle2, ArrowRight, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { formatCurrency, type MockService, type Step } from '@/hooks/useBookingLogic';
import { FormPhoneInput } from '../FormPhoneInput';


interface StyleProps {
  slug?: string;
  logo: string | null;
  extraImage: string | null;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  step: Step;
  setStep: (s: Step) => void;
  selectedService: string;
  setSelectedService: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  selectedTime: string;
  setSelectedTime: (t: string) => void;
  name: string;
  setName: (n: string) => void;
  phone: string;
  setPhone: (p: string) => void;
  email: string;
  setEmail: (e: string) => void;
  birthDate: string;
  setBirthDate: (d: string) => void;
  service: MockService | undefined;
  mockServices: MockService[];
  availableSlots: string[];
  dates: Date[];
  handleConfirm: (e: React.FormEvent) => void;
  reset: () => void;
  t: (key: string) => string;
  locale: string;
}

// ========== SHARED HELPERS ==========
const StepDots = ({ step, className = '' }: { step: Step; className?: string }) => {
  const steps: Step[] = ['service', 'datetime', 'info'];
  const currentIdx = steps.indexOf(step);
  return (
    <div className={`flex items-center justify-center gap-2 mb-6 ${className}`}>
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step === s ? 'bg-primary text-primary-foreground' :
            (currentIdx > i || step === 'done') ? 'bg-primary/20 text-primary' :
            'bg-secondary text-muted-foreground'
          }`}>{i + 1}</div>
          {i < 2 && <div className="w-8 h-0.5 bg-border rounded" />}
        </div>
      ))}
    </div>
  );
};

const LogoBlock = ({ logo, slug, t }: { logo: string | null; slug?: string; t: (k: string) => string }) => (
  <>
    {logo ? (
      <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto mb-3 border border-border bg-card">
        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
      </div>
    ) : (
      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
        <Calendar className="w-6 h-6 text-primary-foreground" />
      </div>
    )}
    <h1 className="text-2xl font-bold font-heading text-foreground capitalize">
      {slug?.replace(/-/g, ' ') || t('business')}
    </h1>
  </>
);

const ServiceList = ({ services, selectedService, onSelect, t }: { services: MockService[]; selectedService: string; onSelect: (id: string) => void; t: (k: string) => string }) => (
  <div className="space-y-3">
    <h2 className="text-base font-semibold text-foreground">{t('chooseService')}</h2>
    {services.map(s => (
      <button key={s.id} onClick={() => onSelect(s.id)}
        className={`w-full card-elevated p-4 text-left hover:border-primary/30 transition-all flex items-center justify-between ${selectedService === s.id ? 'border-primary bg-accent/50' : ''}`}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{s.name}</p>
          {s.descricao && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.descricao}</p>}
          <p className="text-xs text-muted-foreground mt-0.5">{s.duracao} min</p>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          {s.preco != null && <span className="text-sm font-semibold text-foreground">{formatCurrency(s.moeda)} {s.preco}</span>}
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>
    ))}
  </div>
);

const BookingFooter = ({ businessEmail, businessPhone, businessAddress }: { businessEmail: string; businessPhone: string; businessAddress: string }) => {
  const hasInfo = businessEmail || businessPhone || businessAddress;
  if (!hasInfo) return null;
  return (
    <div className="border-t border-border mt-10 pt-6 pb-4">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        {businessPhone && (
          <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{businessPhone}</span>
        )}
        {businessEmail && (
          <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{businessEmail}</span>
        )}
        {businessAddress && (
          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{businessAddress}</span>
        )}
      </div>
    </div>
  );
};

const DateGrid = ({ dates, selectedDate, onSelect, locale }: { dates: Date[]; selectedDate: string; onSelect: (d: string) => void; locale: string }) => (
  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
    {dates.map(d => {
      const ds = d.toISOString().split('T')[0];
      return (
        <button key={ds} onClick={() => onSelect(ds)}
          className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs transition-all ${
            selectedDate === ds ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:border-primary/30 text-muted-foreground'
          }`}>
          <span className="font-medium">{d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')}</span>
          <span className="text-base font-bold mt-0.5">{d.getDate()}</span>
        </button>
      );
    })}
  </div>
);

const TimeGrid = ({ slots, selectedTime, onSelect, t }: { slots: string[]; selectedTime: string; onSelect: (t: string) => void; t: (k: string) => string }) => (
  slots.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">{t('noTimesAvailable')}</p> : (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
      {slots.map(time => (
        <button key={time} onClick={() => onSelect(time)}
          className={`py-2 rounded-lg text-sm font-medium transition-all ${
            selectedTime === time ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:border-primary/30 text-foreground'
          }`}>{time}</button>
      ))}
    </div>
  )
);

const SummaryCard = ({ service, selectedDate, selectedTime, locale, t }: { service?: MockService; selectedDate: string; selectedTime: string; locale: string; t: (k: string) => string }) => (
  <div className="card-elevated p-4 space-y-1">
    <p className="text-sm font-medium text-foreground">{service?.name}</p>
    <p className="text-xs text-muted-foreground flex items-center gap-1">
      <Calendar className="w-3 h-3" />
      {new Date(selectedDate + 'T12:00:00').toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
    </p>
    <p className="text-xs text-muted-foreground flex items-center gap-1">
      <Clock className="w-3 h-3" />{selectedTime} · {service?.duracao}min
    </p>
  </div>
);

const InfoForm = ({ name, setName, phone, setPhone, email, setEmail, birthDate, setBirthDate, handleConfirm, t }: Pick<StyleProps, 'name' | 'setName' | 'phone' | 'setPhone' | 'email' | 'setEmail' | 'birthDate' | 'setBirthDate' | 'handleConfirm' | 't'>) => (
  <form onSubmit={handleConfirm} className="space-y-4">
    <FormInput label={t('name')} value={name} onChange={e => setName(e.target.value)} placeholder={t('yourFullName')} required />

    <FormInput label={t('phone')} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" required />


          <FormPhoneInput
            label={t('phone')}
            value={phone}
            onChange={setPhone}
          />

    <FormInput label={t('email')} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
    <FormInput label={t('birthDate')} type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} placeholder="01/01/1990" required />
    <button type="submit" className="btn-primary w-full">{t('confirmBooking')}</button>
  </form>
);

const DoneBlock = ({ service, selectedDate, selectedTime, name, locale, reset, t }: Pick<StyleProps, 'service' | 'selectedDate' | 'selectedTime' | 'name' | 'locale' | 'reset' | 't'>) => (
  <div className="text-center py-8">
    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
      <CheckCircle2 className="w-8 h-8 text-success" />
    </div>
    <h2 className="text-xl font-bold font-heading text-foreground">{t('bookingConfirmedTitle')}</h2>
    <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{t('bookingConfirmedDesc')}</p>
    <div className="card-elevated p-4 mt-6 text-left space-y-1 max-w-xs mx-auto">
      <p className="text-sm font-medium text-foreground">{service?.name}</p>
      <p className="text-xs text-muted-foreground">
        {new Date(selectedDate + 'T12:00:00').toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })} · {selectedTime}
      </p>
      <p className="text-xs text-muted-foreground">{name}</p>
    </div>
    <button onClick={reset} className="btn-outline mt-6">{t('makeAnother')}</button>
  </div>
);

// ========== 1. CLASSIC (default) ==========
export function ClassicStyle(p: StyleProps) {
  return (
    <div className="min-h-screen bg-background flex items-start justify-center pt-8 pb-12 px-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-6">
          {p.extraImage && <div className="w-full h-32 rounded-xl overflow-hidden mb-4"><img src={p.extraImage} alt="" className="w-full h-full object-cover" /></div>}
          <LogoBlock logo={p.logo} slug={p.slug} t={p.t} />
          <p className="text-sm text-muted-foreground mt-1">{p.t('chooseServiceAndBook')}</p>
        </div>
        {p.step !== 'done' && <StepDots step={p.step} />}
        {p.step === 'service' && <ServiceList services={p.mockServices} selectedService={p.selectedService} onSelect={id => { p.setSelectedService(id); p.setStep('datetime'); }} t={p.t} />}
        {p.step === 'datetime' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <button onClick={() => p.setStep('service')} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></button>
              <h2 className="text-base font-semibold text-foreground">{p.t('chooseDatetime')}</h2>
            </div>
            {p.service && <div className="badge-primary text-xs">{p.service.name} · {p.service.duracao}min{p.service.preco != null && ` · ${formatCurrency(p.service.moeda)}${p.service.preco}`}</div>}
            <div><p className="text-sm font-medium text-foreground mb-2">{p.t('dateLabel')}</p><DateGrid dates={p.dates} selectedDate={p.selectedDate} onSelect={p.setSelectedDate} locale={p.locale} /></div>
            {p.selectedDate && <div><p className="text-sm font-medium text-foreground mb-2">{p.t('timeLabel')}</p><TimeGrid slots={p.availableSlots} selectedTime={p.selectedTime} onSelect={t => { p.setSelectedTime(t); p.setStep('info'); }} t={p.t} /></div>}
          </div>
        )}
        {p.step === 'info' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2"><button onClick={() => p.setStep('datetime')} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></button><h2 className="text-base font-semibold text-foreground">{p.t('yourData')}</h2></div>
            <SummaryCard service={p.service} selectedDate={p.selectedDate} selectedTime={p.selectedTime} locale={p.locale} t={p.t} />
            <InfoForm {...p} />
          </div>
        )}
        {p.step === 'done' && <DoneBlock {...p} />}
        <BookingFooter businessEmail={p.businessEmail} businessPhone={p.businessPhone} businessAddress={p.businessAddress} />
      </div>
    </div>
  );
}

// ========== 2. MINIMAL ==========
export function MinimalStyle(p: StyleProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-10 text-center">
          {p.logo && <img src={p.logo} alt="Logo" className="w-10 h-10 rounded-full mx-auto mb-4 object-contain" />}
          <h1 className="text-lg font-medium text-foreground capitalize">{p.slug?.replace(/-/g, ' ') || p.t('business')}</h1>
        </div>
        {p.step !== 'done' && (
          <div className="flex justify-center gap-3 mb-8">
            {['service', 'datetime', 'info'].map((s, i) => (
              <div key={s} className={`w-2 h-2 rounded-full transition-all ${p.step === s ? 'bg-foreground scale-125' : 'bg-border'}`} />
            ))}
          </div>
        )}
        {p.step === 'service' && (
          <div className="space-y-2">
            {p.mockServices.map(s => (
              <button key={s.id} onClick={() => { p.setSelectedService(s.id); p.setStep('datetime'); }}
                className="w-full text-left py-4 px-1 border-b border-border hover:bg-accent/30 transition-all flex justify-between items-center group">
                <div>
                  <p className="text-sm text-foreground">{s.name}</p>
                  {s.descricao && <p className="text-xs text-muted-foreground mt-0.5">{s.descricao}</p>}
                  <p className="text-xs text-muted-foreground">{s.duracao} min</p>
                </div>
                {s.preco != null && <span className="text-sm text-muted-foreground">{formatCurrency(s.moeda)} {s.preco}</span>}
              </button>
            ))}
          </div>
        )}
        {p.step === 'datetime' && (
          <div className="space-y-6">
            <button onClick={() => p.setStep('service')} className="text-xs text-muted-foreground hover:text-foreground">← {p.t('chooseService')}</button>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.t('dateLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {p.dates.map(d => { const ds = d.toISOString().split('T')[0]; return (
                <button key={ds} onClick={() => p.setSelectedDate(ds)}
                  className={`px-3 py-2 rounded text-xs transition-all ${p.selectedDate === ds ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
                  {d.getDate()}/{d.getMonth() + 1}
                </button>
              ); })}
            </div>
            {p.selectedDate && <>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.t('timeLabel')}</p>
              <div className="flex flex-wrap gap-2">
                {p.availableSlots.map(time => (
                  <button key={time} onClick={() => { p.setSelectedTime(time); p.setStep('info'); }}
                    className={`px-3 py-2 rounded text-xs transition-all ${p.selectedTime === time ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>{time}</button>
                ))}
              </div>
            </>}
          </div>
        )}
        {p.step === 'info' && (
          <div className="space-y-6">
            <button onClick={() => p.setStep('datetime')} className="text-xs text-muted-foreground hover:text-foreground">← {p.t('chooseDatetime')}</button>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>{p.service?.name} · {p.service?.duracao}min</p>
              <p>{new Date(p.selectedDate + 'T12:00:00').toLocaleDateString(p.locale, { day: 'numeric', month: 'short' })} · {p.selectedTime}</p>
            </div>
            <InfoForm {...p} />
          </div>
        )}
        {p.step === 'done' && <DoneBlock {...p} />}
        <BookingFooter businessEmail={p.businessEmail} businessPhone={p.businessPhone} businessAddress={p.businessAddress} />
      </div>
    </div>
  );
}

// ========== 3. BOLD ==========
export function BoldStyle(p: StyleProps) {
  return (
    <div className="min-h-screen bg-primary/5">
      {p.extraImage && <div className="w-full h-48 overflow-hidden"><img src={p.extraImage} alt="" className="w-full h-full object-cover" /></div>}
      <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in">
        <div className="text-center mb-8">
          {p.logo && <img src={p.logo} alt="Logo" className="w-20 h-20 rounded-2xl mx-auto mb-4 border-4 border-primary/20 object-contain bg-card" />}
          <h1 className="text-3xl font-bold font-heading text-foreground capitalize">{p.slug?.replace(/-/g, ' ') || p.t('business')}</h1>
          <p className="text-base text-primary font-medium mt-2">{p.t('chooseServiceAndBook')}</p>
        </div>
        {p.step !== 'done' && <StepDots step={p.step} />}
        {p.step === 'service' && (
          <div className="grid gap-3">
            {p.mockServices.map(s => (
              <button key={s.id} onClick={() => { p.setSelectedService(s.id); p.setStep('datetime'); }}
                className="bg-card rounded-2xl p-5 text-left hover:shadow-lg transition-all border-2 border-transparent hover:border-primary flex justify-between items-center">
                <div>
                  <p className="text-base font-bold text-foreground">{s.name}</p>
                  {s.descricao && <p className="text-sm text-muted-foreground mt-0.5">{s.descricao}</p>}
                  <p className="text-sm text-muted-foreground">{s.duracao} min</p>
                </div>
                <div className="text-right">
                  {s.preco != null && <p className="text-lg font-bold text-primary">{formatCurrency(s.moeda)} {s.preco}</p>}
                  <ArrowRight className="w-5 h-5 text-primary ml-auto mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}
        {p.step === 'datetime' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2"><button onClick={() => p.setStep('service')} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></button><h2 className="text-lg font-bold text-foreground">{p.t('chooseDatetime')}</h2></div>
            {p.service && <div className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium inline-block">{p.service.name} · {p.service.duracao}min</div>}
            <DateGrid dates={p.dates} selectedDate={p.selectedDate} onSelect={p.setSelectedDate} locale={p.locale} />
            {p.selectedDate && <TimeGrid slots={p.availableSlots} selectedTime={p.selectedTime} onSelect={t => { p.setSelectedTime(t); p.setStep('info'); }} t={p.t} />}
          </div>
        )}
        {p.step === 'info' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2"><button onClick={() => p.setStep('datetime')} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></button><h2 className="text-lg font-bold text-foreground">{p.t('yourData')}</h2></div>
            <SummaryCard service={p.service} selectedDate={p.selectedDate} selectedTime={p.selectedTime} locale={p.locale} t={p.t} />
            <InfoForm {...p} />
          </div>
        )}
        {p.step === 'done' && <DoneBlock {...p} />}
        <BookingFooter businessEmail={p.businessEmail} businessPhone={p.businessPhone} businessAddress={p.businessAddress} />
      </div>
    </div>
  );
}

// ========== 4. ELEGANT ==========
export function ElegantStyle(p: StyleProps) {
  return (
    <div className="min-h-screen bg-background flex items-start justify-center pt-12 pb-12 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8 border-b border-border pb-8">
          {p.extraImage && <div className="w-full h-40 rounded-2xl overflow-hidden mb-6 shadow-lg"><img src={p.extraImage} alt="" className="w-full h-full object-cover" /></div>}
          {p.logo && <img src={p.logo} alt="Logo" className="w-14 h-14 rounded-full mx-auto mb-3 object-contain border border-border" />}
          <h1 className="text-xl font-heading text-foreground capitalize tracking-wide">{p.slug?.replace(/-/g, ' ') || p.t('business')}</h1>
          <p className="text-xs text-muted-foreground mt-2 italic">{p.t('chooseServiceAndBook')}</p>
        </div>
        {p.step !== 'done' && (
          <div className="flex justify-center gap-6 mb-8">
            {['service', 'datetime', 'info'].map((s, i) => (
              <div key={s} className={`text-xs tracking-widest uppercase transition-all ${p.step === s ? 'text-foreground font-semibold border-b-2 border-primary pb-1' : 'text-muted-foreground'}`}>
                {i === 0 ? p.t('service') : i === 1 ? p.t('date') : p.t('client')}
              </div>
            ))}
          </div>
        )}
        {p.step === 'service' && (
          <div className="space-y-2">
            {p.mockServices.map(s => (
              <button key={s.id} onClick={() => { p.setSelectedService(s.id); p.setStep('datetime'); }}
                className="w-full py-4 px-4 text-left hover:bg-accent/30 rounded-lg transition-all flex justify-between items-center border border-transparent hover:border-border">
                <div>
                  <p className="text-sm text-foreground font-medium tracking-wide">{s.name}</p>
                  {s.descricao && <p className="text-xs text-muted-foreground mt-0.5">{s.descricao}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">{s.duracao} min</p>
                </div>
                {s.preco != null && <span className="text-sm text-foreground">{formatCurrency(s.moeda)} {s.preco}</span>}
              </button>
            ))}
          </div>
        )}
        {p.step === 'datetime' && (
          <div className="space-y-5">
            <button onClick={() => p.setStep('service')} className="text-xs text-muted-foreground hover:text-foreground">← {p.t('chooseService')}</button>
            <DateGrid dates={p.dates} selectedDate={p.selectedDate} onSelect={p.setSelectedDate} locale={p.locale} />
            {p.selectedDate && <TimeGrid slots={p.availableSlots} selectedTime={p.selectedTime} onSelect={t => { p.setSelectedTime(t); p.setStep('info'); }} t={p.t} />}
          </div>
        )}
        {p.step === 'info' && (
          <div className="space-y-5">
            <button onClick={() => p.setStep('datetime')} className="text-xs text-muted-foreground hover:text-foreground">← {p.t('chooseDatetime')}</button>
            <SummaryCard service={p.service} selectedDate={p.selectedDate} selectedTime={p.selectedTime} locale={p.locale} t={p.t} />
            <InfoForm {...p} />
          </div>
        )}
        {p.step === 'done' && <DoneBlock {...p} />}
        <BookingFooter businessEmail={p.businessEmail} businessPhone={p.businessPhone} businessAddress={p.businessAddress} />
      </div>
    </div>
  );
}

// ========== 5. COMPACT ==========
export function CompactStyle(p: StyleProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          {p.logo ? <img src={p.logo} alt="Logo" className="w-10 h-10 rounded-lg object-contain border border-border" /> : <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center"><Calendar className="w-5 h-5 text-primary-foreground" /></div>}
          <div>
            <h1 className="text-lg font-bold font-heading text-foreground capitalize">{p.slug?.replace(/-/g, ' ') || p.t('business')}</h1>
            <p className="text-xs text-muted-foreground">{p.t('chooseServiceAndBook')}</p>
          </div>
        </div>
        {p.step !== 'done' && <StepDots step={p.step} className="mb-4" />}
        {p.step === 'service' && (
          <div className="grid sm:grid-cols-2 gap-2">
            {p.mockServices.map(s => (
              <button key={s.id} onClick={() => { p.setSelectedService(s.id); p.setStep('datetime'); }}
                className="card-elevated p-3 text-left hover:border-primary/30 transition-all">
                <p className="text-sm font-medium text-foreground">{s.name}</p>
                {s.descricao && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.descricao}</p>}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{s.duracao} min</span>
                  {s.preco != null && <span className="text-xs font-semibold text-primary">{formatCurrency(s.moeda)} {s.preco}</span>}
                </div>
              </button>
            ))}
          </div>
        )}
        {p.step === 'datetime' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2"><button onClick={() => p.setStep('service')} className="btn-ghost p-1 text-xs"><ArrowLeft className="w-3 h-3" /></button><span className="text-sm font-medium text-foreground">{p.service?.name}</span></div>
            <DateGrid dates={p.dates} selectedDate={p.selectedDate} onSelect={p.setSelectedDate} locale={p.locale} />
            {p.selectedDate && <TimeGrid slots={p.availableSlots} selectedTime={p.selectedTime} onSelect={t => { p.setSelectedTime(t); p.setStep('info'); }} t={p.t} />}
          </div>
        )}
        {p.step === 'info' && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <button onClick={() => p.setStep('datetime')} className="text-xs text-muted-foreground hover:text-foreground mb-3 block">← {p.t('chooseDatetime')}</button>
              <SummaryCard service={p.service} selectedDate={p.selectedDate} selectedTime={p.selectedTime} locale={p.locale} t={p.t} />
            </div>
            <InfoForm {...p} />
          </div>
        )}
        {p.step === 'done' && <DoneBlock {...p} />}
        <BookingFooter businessEmail={p.businessEmail} businessPhone={p.businessPhone} businessAddress={p.businessAddress} />
      </div>
    </div>
  );
}

// ========== 6. GLASS ==========
export function GlassStyle(p: StyleProps) {
  return (
    <div className="min-h-screen relative flex items-start justify-center pt-8 pb-12 px-4" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent)), hsl(var(--primary) / 0.1))' }}>
      {p.extraImage && <div className="absolute inset-0 overflow-hidden"><img src={p.extraImage} alt="" className="w-full h-full object-cover opacity-20" /></div>}
      <div className="w-full max-w-lg animate-fade-in relative z-10">
        <div className="rounded-2xl p-6 mb-6 text-center" style={{ background: 'hsl(var(--card) / 0.7)', backdropFilter: 'blur(20px)', border: '1px solid hsl(var(--border) / 0.5)' }}>
          <LogoBlock logo={p.logo} slug={p.slug} t={p.t} />
          <p className="text-sm text-muted-foreground mt-1">{p.t('chooseServiceAndBook')}</p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'hsl(var(--card) / 0.7)', backdropFilter: 'blur(20px)', border: '1px solid hsl(var(--border) / 0.5)' }}>
          {p.step !== 'done' && <StepDots step={p.step} />}
          {p.step === 'service' && <ServiceList services={p.mockServices} selectedService={p.selectedService} onSelect={id => { p.setSelectedService(id); p.setStep('datetime'); }} t={p.t} />}
          {p.step === 'datetime' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2"><button onClick={() => p.setStep('service')} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></button><h2 className="text-base font-semibold text-foreground">{p.t('chooseDatetime')}</h2></div>
              <DateGrid dates={p.dates} selectedDate={p.selectedDate} onSelect={p.setSelectedDate} locale={p.locale} />
              {p.selectedDate && <TimeGrid slots={p.availableSlots} selectedTime={p.selectedTime} onSelect={t => { p.setSelectedTime(t); p.setStep('info'); }} t={p.t} />}
            </div>
          )}
          {p.step === 'info' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2"><button onClick={() => p.setStep('datetime')} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></button><h2 className="text-base font-semibold text-foreground">{p.t('yourData')}</h2></div>
              <SummaryCard service={p.service} selectedDate={p.selectedDate} selectedTime={p.selectedTime} locale={p.locale} t={p.t} />
              <InfoForm {...p} />
            </div>
          )}
          {p.step === 'done' && <DoneBlock {...p} />}
          <BookingFooter businessEmail={p.businessEmail} businessPhone={p.businessPhone} businessAddress={p.businessAddress} />
        </div>
      </div>
    </div>
  );
}

// ========== 7. PLAYFUL ==========
export function PlayfulStyle(p: StyleProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-8" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--warning) / 0.06) 0%, transparent 50%)' }}>
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="text-center mb-8">
          {p.logo ? <img src={p.logo} alt="Logo" className="w-16 h-16 rounded-full mx-auto mb-3 object-contain border-4 border-warning/30 shadow-md" /> : <div className="w-16 h-16 rounded-full bg-warning flex items-center justify-center mx-auto mb-3 shadow-md"><Calendar className="w-7 h-7 text-warning-foreground" /></div>}
          <h1 className="text-2xl font-bold font-heading text-foreground capitalize">{p.slug?.replace(/-/g, ' ') || p.t('business')} ✨</h1>
          <p className="text-sm text-muted-foreground mt-1">{p.t('chooseServiceAndBook')}</p>
        </div>
        {p.step !== 'done' && (
          <div className="flex justify-center gap-2 mb-6">
            {['service', 'datetime', 'info'].map((s, i) => (
              <div key={s} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${p.step === s ? 'bg-warning text-warning-foreground' : 'bg-secondary text-muted-foreground'}`}>
                {i + 1}
              </div>
            ))}
          </div>
        )}
        {p.step === 'service' && (
          <div className="space-y-3">
            {p.mockServices.map(s => (
              <button key={s.id} onClick={() => { p.setSelectedService(s.id); p.setStep('datetime'); }}
                className="w-full bg-card rounded-2xl p-4 text-left hover:scale-[1.02] transition-all shadow-sm border border-border flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-foreground">{s.name} 💈</p>
                  {s.descricao && <p className="text-xs text-muted-foreground mt-0.5">{s.descricao}</p>}
                  <p className="text-xs text-muted-foreground">{s.duracao} min</p>
                </div>
                {s.preco != null && <span className="bg-warning/10 text-warning px-2 py-1 rounded-full text-xs font-bold">{formatCurrency(s.moeda)} {s.preco}</span>}
              </button>
            ))}
          </div>
        )}
        {p.step === 'datetime' && (
          <div className="space-y-5">
            <button onClick={() => p.setStep('service')} className="text-xs text-muted-foreground hover:text-foreground">← {p.t('chooseService')}</button>
            <DateGrid dates={p.dates} selectedDate={p.selectedDate} onSelect={p.setSelectedDate} locale={p.locale} />
            {p.selectedDate && <TimeGrid slots={p.availableSlots} selectedTime={p.selectedTime} onSelect={t => { p.setSelectedTime(t); p.setStep('info'); }} t={p.t} />}
          </div>
        )}
        {p.step === 'info' && (
          <div className="space-y-5">
            <button onClick={() => p.setStep('datetime')} className="text-xs text-muted-foreground hover:text-foreground">← {p.t('chooseDatetime')}</button>
            <SummaryCard service={p.service} selectedDate={p.selectedDate} selectedTime={p.selectedTime} locale={p.locale} t={p.t} />
            <InfoForm {...p} />
          </div>
        )}
        {p.step === 'done' && <DoneBlock {...p} />}
        <BookingFooter businessEmail={p.businessEmail} businessPhone={p.businessPhone} businessAddress={p.businessAddress} />
      </div>
    </div>
  );
}

// ========== 8. CORPORATE ==========
export function CorporateStyle(p: StyleProps) {
  return (
    <div className="min-h-screen bg-secondary/50 px-4 py-10">
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="bg-card rounded-none border border-border shadow-md">
          <div className="bg-primary px-6 py-5 flex items-center gap-4">
            {p.logo && <img src={p.logo} alt="Logo" className="w-12 h-12 rounded object-contain bg-primary-foreground/10" />}
            <div>
              <h1 className="text-lg font-bold text-primary-foreground capitalize">{p.slug?.replace(/-/g, ' ') || p.t('business')}</h1>
              <p className="text-xs text-primary-foreground/70">{p.t('chooseServiceAndBook')}</p>
            </div>
          </div>
          <div className="p-6">
            {p.step !== 'done' && <StepDots step={p.step} />}
            {p.step === 'service' && (
              <table className="w-full">
                <thead><tr className="border-b border-border"><th className="text-left text-xs font-medium text-muted-foreground py-2">{p.t('service')}</th><th className="text-left text-xs font-medium text-muted-foreground py-2">{p.t('duration')}</th><th className="text-right text-xs font-medium text-muted-foreground py-2">{p.t('price')}</th></tr></thead>
                <tbody>
                  {p.mockServices.map(s => (
                    <tr key={s.id} onClick={() => { p.setSelectedService(s.id); p.setStep('datetime'); }} className="border-b border-border hover:bg-accent/30 cursor-pointer transition-colors">
                      <td className="py-3 text-sm text-foreground"><span>{s.name}</span>{s.descricao && <span className="block text-xs text-muted-foreground">{s.descricao}</span>}</td>
                      <td className="py-3 text-sm text-muted-foreground">{s.duracao} min</td>
                      <td className="py-3 text-sm text-foreground text-right">{s.preco != null ? `${formatCurrency(s.moeda)} ${s.preco}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {p.step === 'datetime' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2"><button onClick={() => p.setStep('service')} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></button><h2 className="text-base font-semibold text-foreground">{p.t('chooseDatetime')}</h2></div>
                <DateGrid dates={p.dates} selectedDate={p.selectedDate} onSelect={p.setSelectedDate} locale={p.locale} />
                {p.selectedDate && <TimeGrid slots={p.availableSlots} selectedTime={p.selectedTime} onSelect={t => { p.setSelectedTime(t); p.setStep('info'); }} t={p.t} />}
              </div>
            )}
            {p.step === 'info' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2"><button onClick={() => p.setStep('datetime')} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></button><h2 className="text-base font-semibold text-foreground">{p.t('yourData')}</h2></div>
                <SummaryCard service={p.service} selectedDate={p.selectedDate} selectedTime={p.selectedTime} locale={p.locale} t={p.t} />
                <InfoForm {...p} />
              </div>
            )}
            {p.step === 'done' && <DoneBlock {...p} />}
            <BookingFooter businessEmail={p.businessEmail} businessPhone={p.businessPhone} businessAddress={p.businessAddress} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== 9. MODERN ==========
export function ModernStyle(p: StyleProps) {
  return (
    <div className="min-h-screen bg-background">
      {(p.extraImage || p.logo) && (
        <div className="relative h-56 bg-gradient-to-br from-primary/20 to-accent overflow-hidden">
          {p.extraImage && <img src={p.extraImage} alt="" className="w-full h-full object-cover opacity-60" />}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 flex items-end gap-4">
            {p.logo && <img src={p.logo} alt="Logo" className="w-16 h-16 rounded-2xl object-contain bg-card border-2 border-border shadow-lg" />}
            <div>
              <h1 className="text-2xl font-bold font-heading text-foreground capitalize">{p.slug?.replace(/-/g, ' ') || p.t('business')}</h1>
              <p className="text-xs text-muted-foreground">{p.t('chooseServiceAndBook')}</p>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in">
        {!p.extraImage && !p.logo && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-heading text-foreground capitalize">{p.slug?.replace(/-/g, ' ') || p.t('business')}</h1>
            <p className="text-sm text-muted-foreground">{p.t('chooseServiceAndBook')}</p>
          </div>
        )}
        {p.step !== 'done' && (
          <div className="flex gap-1 mb-6">
            {['service', 'datetime', 'info'].map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${
                (['service', 'datetime', 'info'].indexOf(p.step) >= i || p.step === 'done') ? 'bg-primary' : 'bg-border'
              }`} />
            ))}
          </div>
        )}
        {p.step === 'service' && <ServiceList services={p.mockServices} selectedService={p.selectedService} onSelect={id => { p.setSelectedService(id); p.setStep('datetime'); }} t={p.t} />}
        {p.step === 'datetime' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2"><button onClick={() => p.setStep('service')} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></button><h2 className="text-base font-semibold text-foreground">{p.t('chooseDatetime')}</h2></div>
            <DateGrid dates={p.dates} selectedDate={p.selectedDate} onSelect={p.setSelectedDate} locale={p.locale} />
            {p.selectedDate && <TimeGrid slots={p.availableSlots} selectedTime={p.selectedTime} onSelect={t => { p.setSelectedTime(t); p.setStep('info'); }} t={p.t} />}
          </div>
        )}
        {p.step === 'info' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2"><button onClick={() => p.setStep('datetime')} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></button><h2 className="text-base font-semibold text-foreground">{p.t('yourData')}</h2></div>
            <SummaryCard service={p.service} selectedDate={p.selectedDate} selectedTime={p.selectedTime} locale={p.locale} t={p.t} />
            <InfoForm {...p} />
          </div>
        )}
        {p.step === 'done' && <DoneBlock {...p} />}
        <BookingFooter businessEmail={p.businessEmail} businessPhone={p.businessPhone} businessAddress={p.businessAddress} />
      </div>
    </div>
  );
}

// ========== 10. WARM ==========
export function WarmStyle(p: StyleProps) {
  return (
    <div className="min-h-screen px-4 py-10" style={{ background: 'linear-gradient(180deg, hsl(var(--warning) / 0.08), hsl(var(--background)))' }}>
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="text-center mb-8">
          {p.extraImage && <div className="w-full h-36 rounded-3xl overflow-hidden mb-5 shadow-md"><img src={p.extraImage} alt="" className="w-full h-full object-cover" /></div>}
          {p.logo ? <img src={p.logo} alt="Logo" className="w-14 h-14 rounded-2xl mx-auto mb-3 object-contain shadow-sm border border-warning/20" /> : <div className="w-14 h-14 rounded-2xl bg-warning/20 flex items-center justify-center mx-auto mb-3"><Calendar className="w-6 h-6 text-warning" /></div>}
          <h1 className="text-xl font-bold font-heading text-foreground capitalize">{p.slug?.replace(/-/g, ' ') || p.t('business')}</h1>
          <p className="text-xs text-muted-foreground mt-1">{p.t('chooseServiceAndBook')}</p>
        </div>
        {p.step !== 'done' && (
          <div className="flex justify-center gap-2 mb-6">
            {['service', 'datetime', 'info'].map((s, i) => {
              const active = p.step === s;
              const done = ['service', 'datetime', 'info'].indexOf(p.step) > i || p.step === 'done';
              return <div key={s} className={`w-10 h-1.5 rounded-full transition-all ${active ? 'bg-warning' : done ? 'bg-warning/40' : 'bg-border'}`} />;
            })}
          </div>
        )}
        {p.step === 'service' && (
          <div className="space-y-3">
            {p.mockServices.map(s => (
              <button key={s.id} onClick={() => { p.setSelectedService(s.id); p.setStep('datetime'); }}
                className="w-full bg-card rounded-2xl p-4 text-left shadow-sm border border-warning/10 hover:border-warning/30 transition-all flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  {s.descricao && <p className="text-xs text-muted-foreground mt-0.5">{s.descricao}</p>}
                  <p className="text-xs text-muted-foreground">{s.duracao} min</p>
                </div>
                {s.preco != null && <span className="text-sm font-semibold text-warning">{formatCurrency(s.moeda)} {s.preco}</span>}
              </button>
            ))}
          </div>
        )}
        {p.step === 'datetime' && (
          <div className="space-y-5">
            <button onClick={() => p.setStep('service')} className="text-xs text-muted-foreground hover:text-foreground">← {p.t('chooseService')}</button>
            <DateGrid dates={p.dates} selectedDate={p.selectedDate} onSelect={p.setSelectedDate} locale={p.locale} />
            {p.selectedDate && <TimeGrid slots={p.availableSlots} selectedTime={p.selectedTime} onSelect={t => { p.setSelectedTime(t); p.setStep('info'); }} t={p.t} />}
          </div>
        )}
        {p.step === 'info' && (
          <div className="space-y-5">
            <button onClick={() => p.setStep('datetime')} className="text-xs text-muted-foreground hover:text-foreground">← {p.t('chooseDatetime')}</button>
            <SummaryCard service={p.service} selectedDate={p.selectedDate} selectedTime={p.selectedTime} locale={p.locale} t={p.t} />
            <InfoForm {...p} />
          </div>
        )}
        {p.step === 'done' && <DoneBlock {...p} />}
        <BookingFooter businessEmail={p.businessEmail} businessPhone={p.businessPhone} businessAddress={p.businessAddress} />
      </div>
    </div>
  );
}
