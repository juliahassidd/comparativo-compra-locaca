import React, { useState } from 'react';
import { 
  Car, 
  Key, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Info,
  DollarSign,
  Gauge
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function App() {
  const [step, setStep] = useState(1);
  const [selectedCar, setSelectedCar] = useState({ name: 'Fiat Pulse Audace 1.0 T', price: 115000, subCarmo: 2450 });
  const [selectedPeriod, setSelectedPeriod] = useState(24);
  const [selectedKm, setSelectedKm] = useState(1000);
  const [selectedPayment, setSelectedPayment] = useState('avista');

  const cars = [
    { name: 'Fiat Pulse Audace 1.0 T', price: 115000, subCarmo: 2450, img: '🚗' },
    { name: 'VW Nivus Highline 200 TSI', price: 135000, subCarmo: 2890, img: '🚙' },
    { name: 'Jeep Renegade Sport T270', price: 125000, subCarmo: 2750, img: '🚘' },
    { name: 'Toyota Corolla XEI 2.0', price: 155000, subCarmo: 3400, img: '🏎️' }
  ];

  const periods = [
    { months: 12, label: '1 Ano (12 meses)' },
    { months: 24, label: '2 Anos (24 meses)' },
    { months: 36, label: '3 Anos (36 meses)' },
    { months: 48, label: '4 Anos (48 meses)' }
  ];

  const kmOptions = [
    { km: 1000, label: '1.000 km / mês' },
    { km: 1500, label: '1.500 km / mês' },
    { km: 2000, label: '2.000 km / mês' },
    { km: 3000, label: '3.000 km / mês' }
  ];

  const paymentOptions = [
    { id: 'avista', title: 'À Vista', desc: 'Dinheiro na conta (rende 10% a.a.)' },
    { id: 'financiado', title: 'Financiado', desc: 'Entrada 30% + taxas bancárias' }
  ];

  // Cálculos Financeiros
  const carPrice = selectedCar.price;
  const monthlySubscription = selectedCar.subCarmo + ((selectedKm - 1000) * 150); // Ajuste de KM
  const totalSubscription = monthlySubscription * selectedPeriod;

  // Compra
  const depreciationRateAnnual = 0.10;
  const maintenanceRateAnnual = 0.05;
  const oppCostRateAnnual = 0.10; // 10% a.a.

  const totalDepreciation = carPrice * (Math.pow(1 + depreciationRateAnnual, selectedPeriod / 12) - 1);
  const totalMaintenance = (carPrice * maintenanceRateAnnual) * (selectedPeriod / 12);
  const totalOppCost = selectedPayment === 'avista' ? (carPrice * oppCostRateAnnual * (selectedPeriod / 12)) : (carPrice * 0.3 * oppCostRateAnnual * (selectedPeriod / 12));
  
  // IPVA e Seguro estimado em 6% a.a. no total
  const totalIpvaSeguro = (carPrice * 0.06) * (selectedPeriod / 12);

  const totalPurchaseCost = totalDepreciation + totalMaintenance + totalOppCost + totalIpvaSeguro;

  // Dados para o Gráfico de Evolução Mensal
  const chartData = [];
  for (let m = 1; m <= selectedPeriod; m += Math.max(1, Math.floor(selectedPeriod / 6))) {
    const subCost = monthlySubscription * m;
    const purCost = (totalPurchaseCost / selectedPeriod) * m;
    chartData.push({
      mes: `Mês ${m}`,
      Assinatura: Math.round(subCost),
      Compra: Math.round(purCost),
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-indigo-600 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">Simulador Inteligente</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Compra vs. Carro por Assinatura</h1>
          <p className="text-slate-400 text-sm mt-1">Descubra qual modalidade faz mais sentido para o seu bolso e estilo de vida.</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-100 px-6 py-3 flex justify-between items-center text-xs font-medium text-slate-600 border-b">
          <span className={`${step >= 1 ? 'text-indigo-600 font-bold' : ''}`}>1. Veículo & Uso</span>
          <span>&gt;</span>
          <span className={`${step >= 2 ? 'text-indigo-600 font-bold' : ''}`}>2. Prazo & Pagamento</span>
          <span>&gt;</span>
          <span className={`${step >= 3 ? 'text-indigo-600 font-bold' : ''}`}>3. Resultado Final</span>
        </div>

        {/* Conteúdo dos Passos */}
        <div className="p-6 md:p-8">
          
          {/* PASSO 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Car className="text-indigo-600" /> Escolha o Modelo do Carro
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {cars.map((car, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedCar(car)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedCar.name === car.name ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{car.img}</span>
                      <div>
                        <h3 className="font-bold text-slate-800">{car.name}</h3>
                        <p className="text-sm text-slate-500">Valor ref: R$ {car.price.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    {selectedCar.name === car.name && <CheckCircle2 className="text-indigo-600" />}
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Gauge className="text-indigo-600" /> Quilometragem Mensal Desejada
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {kmOptions.map((k) => (
                  <div
                    key={k.km}
                    onClick={() => setSelectedKm(k.km)}
                    className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all ${selectedKm === k.km ? 'border-indigo-600 bg-indigo-50/50 font-bold text-indigo-900' : 'border-slate-200 text-slate-700'}`}
                  >
                    {k.label}
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={() => setStep(2)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
                >
                  Continuar <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* PASSO 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-indigo-600" /> Qual o Período de Análise?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {periods.map((p) => (
                  <div
                    key={p.months}
                    onClick={() => setSelectedPeriod(p.months)}
                    className={`p-5 rounded-xl border-2 text-center cursor-pointer transition-all ${selectedPeriod === p.months ? 'border-indigo-600 bg-indigo-50/50 font-bold text-indigo-900 shadow-md' : 'border-slate-200 text-slate-700'}`}
                  >
                    {p.label}
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Wallet className="text-indigo-600" /> Forma de Aquisição na Compra
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {paymentOptions.map((pay) => (
                  <div
                    key={pay.id}
                    onClick={() => setSelectedPayment(pay.id)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedPayment === pay.id ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-slate-200'}`}
                  >
                    <h3 className="font-bold text-slate-800">{pay.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{pay.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button 
                  onClick={() => setStep(1)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
                >
                  <ArrowLeft size={18} /> Voltar
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
                >
                  Ver Resultado <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* PASSO 3 - RESULTADOS */}
          {step === 3 && (
            <div>
              <div className="bg-indigo-900 text-white p-6 rounded-2xl mb-8 shadow-lg">
                <span className="bg-indigo-700 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">Veredito do Simulador</span>
                <h3 className="text-2xl font-bold mt-2">
                  {totalSubscription < totalPurchaseCost ? 'Carro por Assinatura é mais vantajoso!' : 'Comprar o Carro é mais vantajoso!'}
                </h3>
                <p className="text-indigo-200 text-sm mt-1">
                  Considerando depreciação de 10% a.a., custos de manutenção, IPVA, seguro e custo de oportunidade do capital.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="border-2 border-indigo-100 bg-indigo-50/30 p-6 rounded-2xl">
                  <h4 className="font-bold text-slate-700 text-lg mb-2">🚗 Carro por Assinatura</h4>
                  <p className="text-3xl font-extrabold text-indigo-600 mb-4">R$ {Math.round(totalSubscription).toLocaleString('pt-BR')}</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Sem preocupação com revenda</li>
                    <li>• Seguro, IPVA e revisões inclusos</li>
                    <li>• Parcela mensal fixa: R$ {Math.round(monthlySubscription).toLocaleString('pt-BR')}</li>
                  </ul>
                </div>

                <div className="border-2 border-slate-200 p-6 rounded-2xl">
                  <h4 className="font-bold text-slate-700 text-lg mb-2">💰 Compra Direta</h4>
                  <p className="text-3xl font-extrabold text-slate-800 mb-4">R$ {Math.round(totalPurchaseCost).toLocaleString('pt-BR')}</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Inclui depreciação real do veículo</li>
                    <li>• Custo de oportunidade do capital (10% a.a.)</li>
                    <li>• Manutenção e seguros anuais estimados</li>
                  </ul>
                </div>
              </div>

              {/* Gráfico */}
              <div className="mb-8">
                <h4 className="font-bold text-slate-800 mb-4">Evolução Comparativa de Custos ao Longo do Tempo</h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                      <Legend />
                      <Area type="monotone" dataKey="Assinatura" stroke="#6366f1" fill="#818cf8" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="Compra" stroke="#64748b" fill="#94a3b8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex justify-between">
                <button 
                  onClick={() => setStep(2)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
                >
                  <ArrowLeft size={18} /> Refazer Simulação
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
