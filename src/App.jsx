import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Car, Calendar, Map, TrendingUp, CheckCircle, Trophy, 
  ChevronRight, ChevronLeft, RotateCcw, Wallet
} from 'lucide-react';

const CARS = [
  { 
    id: 'hatch', 
    name: 'Hatch Compacto', 
    price: 80000, 
    rentBase: 1800, 
    icon: Car,
    description: 'Econômico, ideal para o dia a dia.'
  },
  { 
    id: 'sedan', 
    name: 'Sedan Médio', 
    price: 130000, 
    rentBase: 2800, 
    icon: Car,
    description: 'Conforto e espaço para viagens.'
  },
  { 
    id: 'suv', 
    name: 'SUV Premium', 
    price: 200000, 
    rentBase: 4500, 
    icon: Car,
    description: 'Status, segurança e robustez.'
  },
];

const DURATIONS = [
  { id: 12, label: '12 meses', months: 12 },
  { id: 24, label: '24 meses', months: 24 },
  { id: 36, label: '36 meses', months: 36 },
  { id: 48, label: '48 meses', months: 48 },
];

const MILEAGES = [
  { id: 1000, label: '1.000 km/mês', multiplier: 1.0 },
  { id: 1500, label: '1.500 km/mês', multiplier: 1.15 },
  { id: 2000, label: '2.000 km/mês', multiplier: 1.30 },
  { id: 3000, label: '3.000 km/mês', multiplier: 1.50 },
];

const ASSUMPTIONS = {
  yield: 0.105,       // 10.5% a.a. Custo de oportunidade (aprox. Selic líquida)
  depreciation: 0.10, // 10% a.a. Depreciação
  maintenance: 0.05,  // 5% a.a. Manutenção, IPVA e Seguro
};

const formatCurrency = (value) => 
  new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    maximumFractionDigits: 0 
  }).format(value);

const SelectableCard = ({ selected, onClick, icon: Icon, title, description, details, compact = false }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-2xl border-2 transition-all duration-200 relative flex flex-col h-full ${
      compact ? 'p-4' : 'p-6'
    } ${
      selected 
        ? 'border-slate-900 bg-slate-50 shadow-md scale-[1.02]' 
        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
    }`}
  >
    {selected && (
      <div className={`absolute ${compact ? 'top-2 right-2' : 'top-4 right-4'} text-slate-900 animate-in zoom-in duration-200`}>
        <CheckCircle size={compact ? 20 : 24} className="fill-slate-200" />
      </div>
    )}
    <div className={`mb-3 rounded-full flex items-center justify-center transition-colors ${
      compact ? 'w-10 h-10' : 'w-12 h-12 mb-4'
    } ${
      selected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
    }`}>
      <Icon size={compact ? 20 : 24} strokeWidth={2} />
    </div>
    <h3 className={`font-bold ${compact ? 'text-lg' : 'text-xl mb-1'} ${selected ? 'text-slate-900' : 'text-slate-800'}`}>
      {title}
    </h3>
    {description && (
      <p className="text-slate-500 text-sm mb-4 flex-grow">{description}</p>
    )}
    {details && (
      <div className="w-full pt-3 border-t border-slate-100 flex flex-col gap-2 text-sm mt-auto">
        {details.map((detail, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-slate-500">{detail.label}</span>
            <span className="font-semibold text-slate-900">{detail.value}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default function App() {
  const [step, setStep] = useState(1);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedMileage, setSelectedMileage] = useState(null);

  const results = useMemo(() => {
    if (!selectedCarId || !selectedDuration || !selectedMileage) return null;
    
    const car = CARS.find(c => c.id === selectedCarId);
    const mileageData = MILEAGES.find(m => m.id === selectedMileage);
    const years = selectedDuration / 12;

    // Custos da Assinatura
    const monthlyRent = car.rentBase * mileageData.multiplier;
    const rentTotal = monthlyRent * selectedDuration;
    
    // Custos da Compra
    const depreciation = car.price * ASSUMPTIONS.depreciation * years;
    const maintenance = car.price * ASSUMPTIONS.maintenance * years;
    // Juros compostos sobre o valor imobilizado (Custo de Oportunidade)
    const opportunityCost = car.price * (Math.pow(1 + ASSUMPTIONS.yield, years) - 1);
    const buyTotal = depreciation + maintenance + opportunityCost;

    const winner = buyTotal < rentTotal ? 'buy' : 'rent';
    const difference = Math.abs(buyTotal - rentTotal);
    const percentage = ((difference / Math.max(buyTotal, rentTotal)) * 100).toFixed(1);

    // Gerando dados mês a mês para o gráfico de área
    const chartData = [];
    for (let m = 1; m <= selectedDuration; m++) {
      const mYears = m / 12;
      const mRent = monthlyRent * m;
      const mDep = car.price * ASSUMPTIONS.depreciation * mYears;
      const mMaint = car.price * ASSUMPTIONS.maintenance * mYears;
      const mOpp = car.price * (Math.pow(1 + ASSUMPTIONS.yield, mYears) - 1);
      const mBuy = mDep + mMaint + mOpp;

      chartData.push({
        name: `Mês ${m}`,
        Assinatura: Math.round(mRent),
        Compra: Math.round(mBuy)
      });
    }

    const barData = [
      { name: 'Custo Total Perdido', Compra: buyTotal, Assinatura: rentTotal }
    ];

    return { 
      car, monthlyRent, rentTotal, depreciation, maintenance, opportunityCost, buyTotal, 
      winner, difference, percentage, chartData, barData 
    };
  }, [selectedCarId, selectedDuration, selectedMileage]);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  const resetWizard = () => {
    setStep(1);
    setSelectedCarId(null);
    setSelectedDuration(null);
    setSelectedMileage(null);
  };

  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Qual o modelo desejado?</h2>
        <p className="text-slate-500">Selecione a categoria do veículo para simular.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CARS.map(car => (
          <SelectableCard
            key={car.id}
            selected={selectedCarId === car.id}
            onClick={() => setSelectedCarId(car.id)}
            icon={car.icon}
            title={car.name}
            description={car.description}
            details={[
              { label: 'Valor do Veículo', value: formatCurrency(car.price) },
              { label: 'Assinatura a partir de', value: formatCurrency(car.rentBase) }
            ]}
          />
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Tempo de Contrato</h2>
          <p className="text-slate-500 text-sm">O tempo impacta a depreciação e o custo de oportunidade.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DURATIONS.map(dur => (
            <SelectableCard
              key={dur.id} compact
              selected={selectedDuration === dur.months}
              onClick={() => setSelectedDuration(dur.months)}
              icon={Calendar} title={dur.label}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Franquia de Quilometragem</h2>
          <p className="text-slate-500 text-sm">Quanto você costuma rodar por mês?</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MILEAGES.map(mil => (
            <SelectableCard
              key={mil.id} compact
              selected={selectedMileage === mil.id}
              onClick={() => setSelectedMileage(mil.id)}
              icon={Map} title={mil.label}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    if (!results) return null;
    const isRentWinner = results.winner === 'rent';

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
        
        {/* Banner Veredito */}
        <div className={`p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 text-white shadow-lg ${isRentWinner ? 'bg-slate-900' : 'bg-emerald-600'}`}>
          <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
            <Trophy size={40} className="text-white" />
          </div>
          <div className="text-center md:text-left flex-grow">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              A {isRentWinner ? 'Locação' : 'Compra'} venceu!
            </h2>
            <p className="text-base md:text-lg opacity-90">
              Fica <strong className="font-bold">{results.percentage}% mais barato</strong> {isRentWinner ? 'assinar' : 'comprar'} por {selectedDuration} meses.
            </p>
          </div>
          <div className="text-center md:text-right bg-white/10 p-4 rounded-2xl backdrop-blur-sm min-w-[200px]">
            <p className="text-xs opacity-80 mb-1 uppercase tracking-wider font-semibold">Sua Economia Total</p>
            <p className="text-3xl font-bold">{formatCurrency(results.difference)}</p>
          </div>
        </div>

        {/* Breakdown Financeiro */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Wallet size={20} /></div>
              <h3 className="text-lg font-bold text-slate-900">Custos da Compra</h3>
            </div>
            <div className="space-y-3 flex-grow mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Depreciação ({ASSUMPTIONS.depreciation * 100}% a.a.)</span> 
                <span className="font-medium text-slate-900">{formatCurrency(results.depreciation)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Manutenção/Seguro ({ASSUMPTIONS.maintenance * 100}% a.a.)</span> 
                <span className="font-medium text-slate-900">{formatCurrency(results.maintenance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Custo Oportunidade ({(ASSUMPTIONS.yield * 100).toFixed(1)}% a.a.)</span> 
                <span className="font-medium text-slate-900">{formatCurrency(results.opportunityCost)}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
              <span className="text-xs font-semibold text-slate-500 uppercase">Custo Gerado</span>
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(results.buyTotal)}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Calendar size={20} /></div>
              <h3 className="text-lg font-bold text-slate-900">Custos da Locação</h3>
            </div>
            <div className="space-y-3 flex-grow mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Mensalidades ({selectedDuration}x de {formatCurrency(results.monthlyRent)})</span> 
                <span className="font-medium text-slate-900">{formatCurrency(results.rentTotal)}</span>
              </div>
              <div className="flex justify-between opacity-50">
                <span className="text-slate-600">Depreciação</span> 
                <span className="font-medium text-slate-900">Isento</span>
              </div>
              <div className="flex justify-between opacity-50">
                <span className="text-slate-600">IPVA, Seguro e Manutenção</span> 
                <span className="font-medium text-slate-900">Incluso</span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
              <span className="text-xs font-semibold text-slate-500 uppercase">Custo Gerado</span>
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(results.rentTotal)}</span>
            </div>
          </div>
        </div>

        {/* Gráficos Combinados */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-6 text-center uppercase tracking-wide">Custo Total</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results.barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip formatter={(value) => formatCurrency(value)} cursor={{fill: 'transparent'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <Bar dataKey="Compra" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Assinatura" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-6 text-center uppercase tracking-wide">Evolução do Custo ao Longo dos Meses</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompra" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAssinatura" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" name="Custo da Compra" dataKey="Compra" stroke="#94a3b8" strokeWidth={3} fillOpacity={1} fill="url(#colorCompra)" />
                  <Area type="monotone" name="Custo da Assinatura" dataKey="Assinatura" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorAssinatura)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-5xl w-full mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-slate-200 mb-4 text-slate-900">
            <TrendingUp size={28} />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">
            Comprar ou Assinar?
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
            Simule o custo real financeiro (depreciação e custo de oportunidade) contra o modelo de assinatura.
          </p>
        </div>

        {/* Wizard Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 p-6 md:p-10 min-h-[500px] flex flex-col">
          
          {/* Progress Indicator */}
          {step < 3 && (
            <div className="flex items-center justify-center mb-10">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
                <div className={`w-16 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-slate-900' : 'bg-slate-100'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
                <div className={`w-16 h-1 rounded-full transition-colors ${step >= 3 ? 'bg-slate-900' : 'bg-slate-100'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 3 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
              </div>
            </div>
          )}

          {/* Dynamic Content */}
          <div className="flex-grow flex flex-col justify-center">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>

          {/* Navigation */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
            {step > 1 && step < 3 ? (
              <button onClick={prevStep} className="flex items-center px-5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium transition-colors">
                <ChevronLeft size={20} className="mr-1" /> Voltar
              </button>
            ) : <div />}
            
            {step === 1 && (
              <button disabled={!selectedCarId} onClick={nextStep} className="flex items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md ml-auto">
                Próximo Passo <ChevronRight size={20} className="ml-1" />
              </button>
            )}

            {step === 2 && (
              <button disabled={!selectedDuration || !selectedMileage} onClick={nextStep} className="flex items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md ml-auto">
                Ver Resultados <TrendingUp size={20} className="ml-2" />
              </button>
            )}

            {step === 3 && (
              <button onClick={resetWizard} className="mx-auto flex items-center px-6 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-xl transition-all">
                <RotateCcw size={20} className="mr-2" /> Refazer Simulação
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
