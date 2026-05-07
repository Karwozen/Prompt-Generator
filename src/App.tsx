import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { 
  Loader2, Sparkles, Copy, CheckCircle2, Wand2, 
  MapPin, Instagram, Users, Flame, Gift, Palette, Code, Layers 
} from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const VIBE_OPTIONS = [
  { id: 'Minimalista', desc: 'Clean, focado no essencial' },
  { id: 'Brutalista', desc: 'Forte, tipografia marcante' },
  { id: 'High-Tech', desc: 'Dark mode, neon e grids' },
  { id: 'Luxo', desc: 'Elegante, serifadas, ouro/prata' },
  { id: 'Orgânico', desc: 'Cores terrosas, formas fluidas' }
];

const COLOR_PALETTES = [
  { id: 'Ocean Blue', colors: ['#0369a1', '#e0f2fe'] },
  { id: 'Midnight Gold', colors: ['#1e293b', '#fbbf24'] },
  { id: 'Forest Green', colors: ['#166534', '#dcfce7'] },
  { id: 'Vibrant Startup', colors: ['#7c3aed', '#fbcfe8'] },
  { id: 'Tech Neon', colors: ['#000000', '#22d3ee'] },
  { id: 'Cyberpunk Pink', colors: ['#171717', '#ec4899'] },
  { id: 'Sunset Orange', colors: ['#c2410c', '#ffedd5'] },
  { id: 'Earthy Brown', colors: ['#451a03', '#fef3c7'] },
  { id: 'Monochrome', colors: ['#171717', '#f5f5f5'] },
  { id: 'Cherry Red', colors: ['#b91c1c', '#fee2e2'] },
];

interface DesignSystem {
  colors: { name: string; hex: string }[];
  typography: { headings: string; body: string };
  components: string[];
}

interface GenerationResult {
  prompt: string;
  designSystem: DesignSystem;
}

async function generateCroPrompt(data: any): Promise<GenerationResult> {
  const prompt = `Você é um Especialista em Conversão (CRO) e UI/UX Designer Sênior com capacidade de navegação em tempo real.

SUA TAREFA OBRIGATÓRIA:
1. Use a ferramenta de busca para acessar e analisar o conteúdo real destes links:
   - Instagram: ${data.instagram}
   - Google Maps: ${data.maps}

2. Extraia dados REAIS sobre:
   - Estética visual das fotos (Instagram).
   - Tom de voz das legendas.
   - Volume e sentimento das avaliações dos clientes (Maps).
   - Serviços mais elogiados.

3. Com base no que você ENCONTROU nos links e nos inputs abaixo, gere um prompt de alta conversão para o site.

INPUTS DE DESIGN & ESTRATÉGIA:
- Nome: ${data.name} | Nicho: ${data.niche}
- Persona: ${data.audience}
- Dores Críticas: ${data.pains}
- Vibe Visual Selecionada: ${data.vibe}
- Paleta de Cores: ${data.colors}

RETORNO:
Devolva ESTRITAMENTE um objeto JSON. Sem markdown adicional, sem blocos de código \`\`\`json, apenas o JSON bruto na seguinte estrutura:
{
  "prompt": "TODO O TEXTO DO PROMPT. Estruturado em Contexto, Tech Stack, Arquitetura (usando Copy AIDA/PAS) e UX Behaviors.",
  "designSystem": {
    "colors": [
      {"name": "Primary", "hex": "#HEX"},
      {"name": "Secondary", "hex": "#HEX"},
      {"name": "Background", "hex": "#HEX"},
      {"name": "Accent", "hex": "#HEX"}
    ],
    "typography": {
      "headings": "Nome da Fonte (ex: Playfair Display)",
      "body": "Nome da Fonte (ex: Inter)"
    },
    "components": [
      "Nome Componente 1 (ex: Bento Grid Diferenciais)",
      "Nome Componente 2",
      "Nome Componente 3",
      "Nome Componente 4"
    ]
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });
    let resultText = response.text || "{}";
    
    // Safely remove markdown formatting if the model still includes it
    resultText = resultText.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
    
    return JSON.parse(resultText) as GenerationResult;
  } catch (error) {
    console.error('Erro no scraping/geração:', error);
    throw new Error('Não foi possível acessar os links ou gerar o prompt. Verifique se os links são públicos.');
  }
}

export default function App() {
  const [formData, setFormData] = useState({ 
    name: '', niche: '', instagram: '', maps: '', 
    vibe: 'Minimalista', colors: 'Ocean Blue',
    audience: '', pains: '', offer: '',
    customColors: ['#6366f1', '#a855f7']
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'prompt' | 'system'>('prompt');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.niche) {
      setError('Nome e Nicho são obrigatórios.');
      return;
    }
    
    setError('');
    setIsGenerating(true);
    setResult(null);
    setActiveTab('prompt');
    
    try {
      const dataToPass = {
        ...formData,
        colors: formData.colors === 'Personalizada' ? `Personalizada: ${formData.customColors.join(', ')}` : formData.colors
      };
      const generated = await generateCroPrompt(dataToPass);
      setResult(generated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full h-screen bg-[#030712] text-slate-200 font-sans flex flex-col overflow-hidden selection:bg-indigo-500/30">
      {/* Top Navigation Bar */}
      <nav className="h-16 border-b border-slate-800 bg-[#030712]/80 backdrop-blur-md flex items-center justify-between px-8 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">PROMPT<span className="text-indigo-400">ARCHITECT</span> <span className="text-xs font-mono text-slate-500 font-normal ml-2 tracking-widest hidden md:inline-block">/ STRATEGIST</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex gap-4 text-sm font-medium text-slate-400">
            <a href="#" className="text-indigo-400 border-b-2 border-indigo-500 pb-1">Intelligence</a>
            <a href="#" className="hover:text-slate-200 transition-colors">Campaigns</a>
            <a href="#" className="hover:text-slate-200 transition-colors">Analytics</a>
          </div>
          <button className="px-5 py-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-full text-[11px] font-bold uppercase tracking-widest text-white transition-all border border-slate-700">
            Upgrade Pro
          </button>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-grow flex flex-col lg:flex-row p-6 gap-6 overflow-hidden">
        {/* Left Column - Input Form */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full lg:w-[450px] flex flex-col gap-6 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 flex-shrink-0"
        >
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl flex-grow flex flex-col">
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-400" />
              Client Intel
            </h2>
            <p className="text-slate-400 text-xs mb-8 leading-relaxed">Defina a inteligência primária. Nossos modelos usarão Web Scraping mental para refinar as informações e estruturar a arquitetura visual.</p>

            <form onSubmit={handleGenerate} className="space-y-6 relative flex-grow flex flex-col">
              
              {/* Group 1: Basics & Links */}
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 border-b border-slate-800 pb-2 mb-4">1. Identidade & Referências</div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Negócio / Marca</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="Ex: Acme Corp" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Nicho / Vertical</label>
                    <input type="text" required value={formData.niche} onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="Ex: SaaS B2B" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-1.5">
                      <Instagram className="w-3 h-3 text-pink-400" /> Link Instagram
                    </label>
                    <input type="text" value={formData.instagram} onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="Ex: @acmecorp" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-red-500" /> Link Google Maps
                    </label>
                    <input type="text" value={formData.maps} onChange={(e) => setFormData(prev => ({ ...prev, maps: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="Ex: maps.app.goo.gl/..." />
                  </div>
                </div>
              </div>

              {/* Group 2: Strategy */}
              <div className="space-y-4 pt-2">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 border-b border-slate-800 pb-2 mb-4">2. Copywriting Strategy</div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-indigo-400" /> Persona Alvo
                  </label>
                  <input type="text" value={formData.audience} onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="C-Levels de empresas Tech" />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-red-400 mb-1.5 flex items-center gap-1.5 ml-1">
                    <Flame className="w-3 h-3" /> Dores Críticas & Desafios de Negócio
                  </label>
                  <textarea 
                    value={formData.pains} 
                    onChange={(e) => setFormData(prev => ({ ...prev, pains: e.target.value }))} 
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none min-h-[120px]" 
                    placeholder="Ex: O cliente tem um site antigo que não passa confiança? Ele perde vendas por não ter agendamento online? O visual atual afasta o público de luxo?" 
                  />
                  <p className="text-[9px] text-slate-500 mt-1.5 italic ml-1">
                    *Identifique o que impede o cliente de vender mais hoje.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-1.5">
                    <Gift className="w-3 h-3 text-emerald-400" /> Oferta Irresistível (Hook)
                  </label>
                  <input type="text" value={formData.offer} onChange={(e) => setFormData(prev => ({ ...prev, offer: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="Diagnóstico gratuito + eBook" />
                </div>
              </div>

              {/* Group 3: Aesthetics */}
              <div className="space-y-4 pt-2">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 border-b border-slate-800 pb-2 mb-4">3. Design Presets (Client Intel)</div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-3 ml-1 flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-indigo-400" /> Visual Vibe
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      {VIBE_OPTIONS.map((vibe) => (
                        <div 
                          key={vibe.id}
                          onClick={() => setFormData(prev => ({ ...prev, vibe: vibe.id }))}
                          className={`cursor-pointer p-3 rounded-xl border transition-all ${
                            formData.vibe === vibe.id 
                              ? 'bg-indigo-500/10 border-indigo-500/50' 
                              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className={`text-xs font-bold mb-1 ${formData.vibe === vibe.id ? 'text-indigo-400' : 'text-slate-300'}`}>
                            {vibe.id}
                          </div>
                          <div className="text-[9px] text-slate-500 leading-tight">
                            {vibe.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-3 ml-1 flex items-center gap-1.5">
                      <Palette className="w-3 h-3 text-indigo-400" /> Color Palette
                    </label>
                     <div className="grid grid-cols-2 gap-2">
                       {COLOR_PALETTES.map((palette) => (
                         <div
                           key={palette.id}
                           onClick={() => setFormData(prev => ({ ...prev, colors: palette.id }))}
                           className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all ${
                            formData.colors === palette.id
                              ? 'bg-indigo-500/10 border-indigo-500/50'
                              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                           }`}
                         >
                           <span className={`text-xs font-bold ${formData.colors === palette.id ? 'text-indigo-400' : 'text-slate-300'}`}>
                             {palette.id}
                           </span>
                           <div className="flex -space-x-1">
                             {palette.colors.map((color, idx) => (
                               <div 
                                 key={idx} 
                                 className="w-4 h-4 rounded-full border border-slate-800 shadow-sm"
                                 style={{ backgroundColor: color }}
                               />
                             ))}
                           </div>
                         </div>
                       ))}
                       
                       {/* Custom Color Option */}
                        <div
                         onClick={() => setFormData(prev => ({ ...prev, colors: 'Personalizada' }))}
                         className={`cursor-pointer p-3 rounded-xl border flex flex-col justify-center transition-all ${
                          formData.colors === 'Personalizada'
                            ? 'bg-indigo-500/10 border-indigo-500/50'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                         }`}
                       >
                         <div className="flex items-center justify-between">
                           <span className={`text-xs font-bold ${formData.colors === 'Personalizada' ? 'text-indigo-400' : 'text-slate-300'}`}>
                             Personalizada
                           </span>
                           {formData.colors !== 'Personalizada' && (
                             <div className="flex -space-x-1">
                               <div className="w-4 h-4 rounded-full border border-slate-800 shadow-sm bg-gradient-to-br from-indigo-500 to-purple-500" />
                               <div className="w-4 h-4 rounded-full border border-slate-800 shadow-sm bg-gradient-to-br from-pink-500 to-orange-400" />
                             </div>
                           )}
                         </div>
                         {formData.colors === 'Personalizada' && (
                           <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                             <div className="flex flex-col flex-1 gap-1">
                               <label className="text-[9px] text-slate-500 font-medium">Cor 1</label>
                               <input 
                                 type="color" 
                                 value={formData.customColors[0]} 
                                 onChange={(e) => {
                                   const newColors = [...formData.customColors];
                                   newColors[0] = e.target.value;
                                   setFormData(prev => ({ ...prev, customColors: newColors }));
                                 }} 
                                 className="w-full h-8 rounded cursor-pointer border-0 bg-transparent p-0" 
                               />
                             </div>
                             <div className="flex flex-col flex-1 gap-1">
                               <label className="text-[9px] text-slate-500 font-medium">Cor 2</label>
                               <input 
                                 type="color" 
                                 value={formData.customColors[1]} 
                                 onChange={(e) => {
                                   const newColors = [...formData.customColors];
                                   newColors[1] = e.target.value;
                                   setFormData(prev => ({ ...prev, customColors: newColors }));
                                 }} 
                                 className="w-full h-8 rounded cursor-pointer border-0 bg-transparent p-0" 
                               />
                             </div>
                           </div>
                         )}
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <div className="flex-grow"></div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full mt-6 py-4 bg-indigo-600 rounded-2xl text-white font-bold text-[13px] tracking-wide shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 disabled:active:scale-100"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    ANALISANDO & GERANDO...
                  </>
                ) : (
                  <>
                    <Code className="w-5 h-5" />
                    GERAR INTELIGÊNCIA DE DESIGN
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.section>

        {/* Right Column - Outputs */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-grow flex flex-col gap-6 overflow-hidden max-h-full"
        >
          {/* Main Output Box Setup */}
          <div className="flex-grow flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden min-h-0 shadow-2xl">
             
             {/* Header with Tabs */}
             <div className="bg-slate-950/80 px-6 pt-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex gap-6">
                  <button 
                    onClick={() => setActiveTab('prompt')}
                    className={`pb-3 text-xs tracking-widest uppercase font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'prompt' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    System Prompt
                  </button>
                  <button 
                    onClick={() => setActiveTab('system')}
                    className={`pb-3 text-xs tracking-widest uppercase font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'system' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    Design System
                  </button>
                </div>
              
              <AnimatePresence>
                {result && activeTab === 'prompt' && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 mb-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY PROMPT</span>
                      </>
                    )}
                  </motion.button>
                 )}
              </AnimatePresence>
             </div>

             {/* Content Area */}
             <div className="flex-grow p-6 md:p-8 overflow-y-auto custom-scrollbar relative">
                {!result && !isGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-500 space-y-4 p-8">
                    <div className="w-20 h-20 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-2 shadow-xl">
                      <Wand2 className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-300">Ready to Architect</h3>
                    <p className="text-sm max-w-sm text-slate-500 leading-relaxed">
                      Preencha a inteligência mercadológica e a IA irá não apenas redigir um prompt avançado, mas também deduzir um Design System completo baseado nas referências fornecidas.
                    </p>
                  </div>
                )}

                {isGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400 gap-5 bg-slate-900/50 backdrop-blur-sm z-10">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <div className="text-sm tracking-widest font-bold uppercase animate-pulse">Engaging Strategy Engine...</div>
                  </div>
                )}

                {!isGenerating && result && activeTab === 'prompt' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-[13px] leading-relaxed text-slate-300 whitespace-pre-wrap select-text max-w-4xl mx-auto"
                  >
                    {result.prompt}
                  </motion.div>
                )}

                {!isGenerating && result && activeTab === 'system' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto space-y-12 pb-8"
                  >
                    {/* Colors */}
                    <section>
                       <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-6">
                         <Palette className="w-5 h-5 text-indigo-400" />
                         <h3 className="text-lg font-bold text-white tracking-wide">Color Foundation</h3>
                       </div>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {result.designSystem.colors.map((c, i) => (
                           <div key={i} className="group bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col gap-3 hover:border-slate-700 transition-colors">
                              <div className="w-full h-20 rounded-xl shadow-inner relative overflow-hidden" style={{backgroundColor: c.hex}}>
                                 <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
                              </div>
                              <div className="px-1">
                                <div className="text-xs text-slate-400 font-medium mb-0.5">{c.name}</div>
                                <div className="text-sm font-mono text-white font-bold">{c.hex}</div>
                              </div>
                           </div>
                         ))}
                       </div>
                    </section>

                    {/* Typography */}
                    <section>
                       <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-6">
                         <div className="w-5 h-5 text-indigo-400 flex items-center justify-center font-serif text-lg leading-none">Aa</div>
                         <h3 className="text-lg font-bold text-white tracking-wide">Typography Hierarchy</h3>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                             <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Headings & Display</div>
                             <div className="text-3xl text-white mb-2" style={{ fontFamily: result.designSystem.typography.headings }}>
                               Aestetica Magna
                             </div>
                             <div className="text-xs font-mono text-indigo-400">{result.designSystem.typography.headings}</div>
                          </div>
                          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
                             <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Body & UI Text</div>
                             <p className="text-sm text-slate-300 mb-4 leading-relaxed" style={{ fontFamily: result.designSystem.typography.body }}>
                               Good design is making something intelligible and memorable. Great design is making something memorable and meaningful.
                             </p>
                             <div className="text-xs font-mono text-indigo-400 mt-auto">{result.designSystem.typography.body}</div>
                          </div>
                       </div>
                    </section>

                    {/* Components */}
                    <section>
                       <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-6">
                         <Layers className="w-5 h-5 text-indigo-400" />
                         <h3 className="text-lg font-bold text-white tracking-wide">UI Architecture Elements</h3>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {result.designSystem.components.map((comp, i) => (
                             <div key={i} className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                  <span className="text-indigo-400 font-mono text-[10px] font-bold">0{i+1}</span>
                                </div>
                                <span className="text-sm text-slate-200 font-medium">{comp}</span>
                             </div>
                          ))}
                       </div>
                    </section>
                  </motion.div>
                )}
             </div>
          </div>

          {/* Analytics Preview Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
            <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center items-center transition-all ${result ? 'border-indigo-500/30 bg-indigo-500/5' : ''}`}>
              <span className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Brand Alignment Score</span>
              <span className={`text-2xl font-bold transition-colors ${result ? 'text-indigo-400' : 'text-slate-700'}`}>{result ? '98.5%' : '--'}</span>
            </div>
            <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center items-center transition-all ${result ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}>
              <span className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Social Proof Integration</span>
              <span className={`text-2xl font-bold transition-colors ${result ? 'text-emerald-400' : 'text-slate-700'}`}>{result ? 'Maximized' : '--'}</span>
            </div>
            <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center items-center transition-all ${result ? 'border-purple-500/30 bg-purple-500/5' : ''}`}>
              <span className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Conversion Power</span>
              <span className={`text-2xl font-bold text-center uppercase tracking-wide transition-colors ${result ? 'text-purple-400' : 'text-slate-700'}`}>{result ? 'A+ Optimal' : '--'}</span>
            </div>
          </div>
        </motion.section>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.15);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.3);
        }
      `}</style>
    </div>
  );
}
