import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { 
  Loader2, Sparkles, Copy, CheckCircle2, Wand2, 
  Link as LinkIcon, Users, Flame, Gift, Palette, Code, Layers 
} from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  const prompt = `Você é um Especialista em Conversão (CRO), Web Scraper Strategist, Designer UI/UX Sênior e Desenvolvedor Full-Stack.
Sua missão é transformar as informações e referências do cliente em um prompt estruturado de altíssimo nível para IAs geradoras de UI (v0.dev, Cursor, Bolt.new, Framer) e, além disso, extrair um Design System sugerido.

DADOS DO CLIENTE:
Nome do Negócio: ${data.name}
Nicho de Atuação: ${data.niche}
Links de Referência (Instagram/Maps etc.): ${data.links}
Vibe Visual Desejada: ${data.vibe}
Paleta Base Desejada: ${data.colors}
Público-Alvo (Persona): ${data.audience}
Principais Dores: ${data.pains}
Oferta Irresistível: ${data.offer}

INSTRUÇÕES DO SCENARIO:
1. Web Scraper Strategist: Utilize sua inteligência geral para inferir o que as referências de "Links" indicam sobre o mercado, tom de voz e avaliações do nicho.
2. Prompt Creation: Escreva o PROMPT PARA IA DE GERAÇÃO estruturado em seções: Contexto, Tech Stack, Arquitetura (usando Copy AIDA/PAS) e UX Behaviors.
3. Design System Extraction: Defina tipografia, paleta e componentes chave ideais para este projeto.

RETORNO:
Devolva ESTRITAMENTE um objeto JSON. Sem markdown adicional, sem blocos de código \`\`\`json, apenas o JSON bruto na seguinte estrutura:
{
  "prompt": "TODO O TEXTO DO PROMPT. Pode incluir quebras de linha com \\n. Detalhe bem a estrutura.",
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
        responseMimeType: "application/json",
      }
    });
    let resultText = response.text || "{}";
    
    // Safely remove markdown formatting if the model still includes it
    resultText = resultText.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
    
    return JSON.parse(resultText) as GenerationResult;
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw new Error('Falha ao gerar o prompt. Tente novamente.');
  }
}

export default function App() {
  const [formData, setFormData] = useState({ 
    name: '', niche: '', links: '', 
    vibe: 'Minimalista', colors: 'Ocean Blue',
    audience: '', pains: '', offer: ''
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
      const generated = await generateCroPrompt(formData);
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

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-1.5">
                    <LinkIcon className="w-3 h-3 text-indigo-400" /> Links Scraper (Maps/Insta/Site)
                  </label>
                  <input type="text" value={formData.links} onChange={(e) => setFormData(prev => ({ ...prev, links: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="Ex: @acmecorp, Google Maps rating..." />
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
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-red-400" /> Principais Dores a Resolver
                  </label>
                  <input type="text" value={formData.pains} onChange={(e) => setFormData(prev => ({ ...prev, pains: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="Processos lentos, perda de receita..." />
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
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-indigo-400" /> Visual Vibe
                    </label>
                    <div className="relative">
                      <select value={formData.vibe} onChange={(e) => setFormData(prev => ({ ...prev, vibe: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer">
                        <option value="Minimalista">Minimalista</option>
                        <option value="Brutalista">Brutalista</option>
                        <option value="High-Tech">High-Tech</option>
                        <option value="Luxo">Luxo</option>
                        <option value="Orgânico">Orgânico</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-1.5">
                      <Palette className="w-3 h-3 text-indigo-400" /> Color Palette
                    </label>
                     <div className="relative">
                      <select value={formData.colors} onChange={(e) => setFormData(prev => ({ ...prev, colors: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer">
                        <option value="Ocean Blue">Ocean Blue</option>
                        <option value="Midnight Gold">Midnight Gold</option>
                        <option value="Forest Green">Forest Green</option>
                        <option value="Vibrant Startup">Vibrant Startup</option>
                        <option value="Tech Neon">Tech Neon</option>
                      </select>
                       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
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
