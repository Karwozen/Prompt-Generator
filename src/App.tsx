import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Loader2, Sparkles, Copy, CheckCircle2, ChevronRight, Wand2 } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateCroPrompt(name: string, niche: string, info: string) {
  const prompt = `Você é um Especialista em Conversão (CRO), Web Designer UI/UX Sênior e Desenvolvedor Full-Stack especializado em arquitetura de vendas. Sua missão é transformar informações básicas de clientes em prompts estruturados de altíssimo nível para serem usados em IAs de geração de código ou design (v0.dev, Cursor, Bolt.new ou Framer).

Diretrizes de Especialista:
- Design Moderno: Utilize referências de layouts atuais como Bento Grids, Minimalismo Moderno, Tipografia Oversized, Glassmorphism e micro-interações fluidas.
- Foco em Conversão: Aplique frameworks de Copywriting (AIDA, PAS ou StoryBrand) em cada seção.
- Escaneabilidade: Mobile-first, CTAs impossíveis de ignorar.
- Inteligência de Nicho: Infira automaticamente a paleta de cores ideal, o tom de voz e a persona do público-alvo com base nos dados.

--- 

DADOS DO CLIENTE:
Nome do Cliente: ${name}
Nicho: ${niche}
Informações Adicionais (Maps/Instagram/Contato): ${info}

---

Sempre gere o retorno SEGUINDO RIGOROSAMENTE ESTE TEMPLATE EXATO. Substitua os colchetes pelas suas sugestões criativas e especializadas:

PROMPT PARA IA DE GERAÇÃO:

1. Objetivo & Contexto:
Crie uma [Landing Page/Site Institucional] de alta conversão para [NOME DO NEGÓCIO]. O objetivo principal é [CONVERSÃO PRINCIPAL]. Estilo visual: [EX: Dark Mode Tech / Sophisticated Minimalist / Organic Clean].

2. Tech Stack & Estética:

Framework: React + Tailwind CSS + Lucide Icons + Framer Motion.

Cores: Primária [HEX], Secundária [HEX], Background [HEX].

Tipografia: Títulos em [FONTE GOOGLE], Corpo em [FONTE GOOGLE].

3. Arquitetura da Página (Seções Detalhadas):

Hero Section: [ESCREVER HEADLINE MAGNÉTICA FOCADA NA DOR], [escrever subheadline persuasiva], e um botão de CTA com efeito de brilho ou hover.

Social Proof: Seção de logos/depoimentos com animação de scroll infinito.

Diferenciais (Bento Grid): Grid moderno exibindo 3 a 4 benefícios principais com ícones minimalistas.

Seção de Autoridade: [Texto focado na experiência e no estabelecimento com base nos dados fornecidos].

FAQ Interativo: Accordion moderno para quebrar as 3 principais objeções do nicho.

Footer/CTA Final: Reiteração da oferta com link direto para [WhatsApp/Reserva/Contato].

4. Comportamentos de UX:

Navbar "Sticky" com blur de fundo.

Animações de "Fade-in on scroll".

Botão flutuante de contato rápido no canto inferior direito.

---
Importante: O retorno deve conter APENAS o prompt gerado. Não adicione texto introdutório.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text || '';
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw new Error('Falha ao gerar o prompt. Tente novamente.');
  }
}

export default function App() {
  const [formData, setFormData] = useState({ name: '', niche: '', info: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.niche) {
      setError('Nome e Nicho são obrigatórios.');
      return;
    }
    
    setError('');
    setIsGenerating(true);
    setGeneratedPrompt('');
    
    try {
      const result = await generateCroPrompt(formData.name, formData.niche, formData.info);
      setGeneratedPrompt(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full h-screen bg-[#030712] text-slate-200 font-sans flex flex-col overflow-hidden selection:bg-indigo-500/30">
      {/* Top Navigation Bar */}
      <nav className="h-16 border-b border-slate-800 bg-[#030712]/80 backdrop-blur-md flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">PROMPT<span className="text-indigo-400">ARCHITECT</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex gap-4 text-sm font-medium text-slate-400">
            <a href="#" className="text-white border-b-2 border-indigo-500 pb-1">Dashboard</a>
            <a href="#" className="hover:text-slate-200 transition-colors">Templates</a>
            <a href="#" className="hover:text-slate-200 transition-colors">Archive</a>
          </div>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-xs font-semibold uppercase tracking-wider text-white transition-all">
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
          transition={{ delay: 0.3 }}
          className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2"
        >
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl flex-grow flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-400" />
              Client Intel
            </h2>
            <p className="text-slate-400 text-sm mb-6">Transforme informações básicas em arquitetura de conversão.</p>

            <form onSubmit={handleGenerate} className="space-y-4 relative flex-grow flex flex-col">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1.5">
                  Nome do Negócio
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Ex: Elevate Dental Spa / Acme Corp"
                />
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1.5">
                  Nicho de Atuação
                </label>
                <input
                  type="text"
                  required
                  value={formData.niche}
                  onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Ex: Odontologia Estética / SaaS B2B"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1.5">
                  Informações Adicionais (Maps/Instagram)
                </label>
                <textarea
                  rows={4}
                  value={formData.info}
                  onChange={(e) => setFormData(prev => ({ ...prev, info: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  placeholder="Ex: Nota 4.9 no Google Maps (100+ avaliações), 20 anos de experiência..."
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <div className="flex-grow"></div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full mt-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AFINANDO ESTRATÉGIA...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    GERAR PROMPT ARQUITETURAL
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="flex flex-col gap-2 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-xs text-slate-500">
            <p className="font-bold tracking-widest text-indigo-400 uppercase text-[10px]">Modo de Uso:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Preencha as informações básicas do seu lead/cliente.</li>
              <li>Gere o prompt arquitetado com técnicas de persuasão (AIDA/PAS).</li>
              <li>Copie e cole diretamente no v0.dev, Cursor ou Bolt.</li>
            </ul>
          </div>
        </motion.section>

        {/* Right Column - Generated Prompt */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full lg:w-2/3 flex flex-col gap-6 overflow-hidden max-h-full"
        >
          {/* Output Terminal */}
          <div className="flex-grow flex flex-col bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden min-h-0">
             {/* Terminal Header */}
             <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                </div>
                <span className="text-[11px] font-mono text-slate-500 ml-4 tracking-tighter uppercase">
                  Generated System Prompt — V1.4.2
                </span>
              </div>
              
              <AnimatePresence>
                {generatedPrompt && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-[11px] text-indigo-400 font-bold uppercase tracking-wider hover:text-indigo-300 transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY TO CLIPBOARD</span>
                      </>
                    )}
                  </motion.button>
                 )}
              </AnimatePresence>
             </div>

             {/* Prompt Content */}
             <div className="flex-grow p-6 md:p-8 overflow-y-auto font-mono text-sm leading-relaxed text-slate-300 custom-scrollbar">
                {!generatedPrompt && !isGenerating && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-center mb-2 shadow-inner">
                      <Sparkles className="w-8 h-8 text-slate-600" />
                    </div>
                    <p>Aguardando informações do cliente...</p>
                    <p className="text-xs max-w-sm text-slate-600">
                      Forneça os detalhes ao lado e a IA inferirá cores, fontes e copy focada em conversão para seu projeto.
                    </p>
                  </div>
                )}

                {isGenerating && (
                  <div className="h-full flex flex-col items-center justify-center text-indigo-400 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <div className="text-sm font-mono animate-pulse">Aplicando frameworks de UX/UI...</div>
                  </div>
                )}

                {!isGenerating && generatedPrompt && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="whitespace-pre-wrap select-text"
                  >
                    {generatedPrompt}
                  </motion.div>
                )}
             </div>
          </div>

          {/* Analytics Preview Bento */}
          {generatedPrompt && !isGenerating && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0"
            >
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Conversion Score</span>
                <span className="text-2xl font-bold text-emerald-400">98.4%</span>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">SEO Density</span>
                <span className="text-2xl font-bold text-white">Optimal</span>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Mobile Rating</span>
                <span className="text-2xl font-bold text-indigo-400 text-center uppercase text-sm">A+ Fluid</span>
              </div>
            </motion.div>
          )}
        </motion.section>
      </main>

      {/* Floating Action Indicator */}
      <div className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 rounded-full hidden md:flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-indigo-400/30">
         <Sparkles className="w-6 h-6 text-white" />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.3);
        }
      `}</style>
    </div>
  );
}
