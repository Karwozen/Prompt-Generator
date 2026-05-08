import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { 
  Loader2, Sparkles, Copy, CheckCircle2, Wand2, 
  MapPin, Instagram, Users, Flame, Gift, Palette, Code, Layers,
  Phone, Plus, CheckSquare, FileJson, Image as ImageIcon, Trash2, Database, Upload, BookOpen
} from 'lucide-react';
import { supabase } from './lib/supabase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const VIBE_OPTIONS = [
  { id: '🤖 IA Automática', desc: 'A IA decide o melhor estilo', preview: <div className="w-full h-10 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-md border border-indigo-500/30 flex items-center justify-center"><Sparkles className="w-4 h-4 text-indigo-400" /></div> },
  { id: 'Minimalista', desc: 'Clean, focado no essencial', preview: <div className="w-full h-10 bg-slate-50 flex items-center justify-center p-2 rounded-md"><div className="w-1/2 h-1.5 bg-slate-200 rounded-full"></div></div> },
  { id: 'Brutalista', desc: 'Forte, tipografia marcante', preview: <div className="w-full h-10 bg-yellow-400 border-2 border-slate-900 flex items-center justify-center rounded-sm"><span className="text-slate-900 font-black text-xs uppercase uppercase">Bold</span></div> },
  { id: 'High-Tech', desc: 'Dark mode, neon e grids', preview: <div className="w-full h-10 bg-slate-950 border border-cyan-500/50 flex items-center justify-center rounded-md relative overflow-hidden"><div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:4px_4px]"></div><div className="w-1/2 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] relative z-10"></div></div> },
  { id: 'Luxo', desc: 'Elegante, serifadas, ouro', preview: <div className="w-full h-10 bg-[#1a1a1a] border border-yellow-700/50 flex items-center justify-center rounded-md"><span className="text-yellow-600 font-serif font-bold text-lg leading-none">A</span></div> },
  { id: 'Orgânico', desc: 'Cores terrosas, fluidas', preview: <div className="w-full h-10 bg-[#f4f1ea] border border-[#d2c9b6] flex items-center justify-center overflow-hidden rounded-xl"><div className="w-5 h-5 bg-[#8b7e66] rounded-full mix-blend-multiply opacity-50 blur-[1px] -translate-x-1"></div><div className="w-5 h-5 bg-[#78826b] rounded-full mix-blend-multiply opacity-50 blur-[1px] translate-x-1"></div></div> }
];

const COLOR_PALETTES = [
  { id: '🎨 Extração Automática', colors: [] },
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
  enhancedPrompt: string;
  designJson: any;
}

async function generateCroPrompt(data: any): Promise<GenerationResult> {
  const vaultContent = data.vaultReferences?.length > 0 ? `
KNOWLEDGE BASE (YOUR REFERENCE BRAIN):
Below are the exact code snippets, design systems, and assets from the user's private vault. You MUST use these as your primary truth and reference for formatting, styling, and coding practices when generating the final prompt.

${data.vaultReferences.map((ref: any) => `File: ${ref.file_name}\nContent:\n${ref.url ? `Asset URL: ${ref.url}` : ref.content}`).join('\n\n')}
` : '';

  const basePrompt = `I am writing a prompt to use in an AI agent specialized in designing beautiful landing pages (like Replit Design Mode, v0.dev, or Cursor). In addition to React/Shadcn/Tailwind code generation, this agent can also generate components and UI structures.

I need to give enough context to it so that it generates a design that matches my expectations.
You are a Master Creative Director and Senior UI/UX Engineer. Your task is to generate this comprehensive prompt based on the user's inputs and reference images.
${vaultContent}
USER INPUTS (Context for generation):

Brand Name: ${data.name || '[Insert dynamic brand]'}

Niche/Business: ${data.niche || '[Insert dynamic niche]'}

Target Audience (Persona): ${data.audience || 'Not provided'}

Irresistible Offer: ${data.offer || 'Not provided'}

WhatsApp Contact: ${data.whatsapp || 'Not provided'}

Sections Requested by User: ${data.sections.join(', ')}
${data.imageBase64 ? '- Visual Guidelines: Deeply analyse the design of the attached screenshot.' : '- Visual Guidelines: Infer best modern design practices based on the niche.'}

YOUR MISSION:

${data.imageBase64 ? 'Deeply analyse the design of the attached screenshot. Capture high level guidelines for structure, spacing, fonts, colours, design style and design principles.' : 'Create a high-converting, modern design system.'}

Generate the FINAL PROMPT following the strict template below, acting as if you are giving instructions to the UI AI. Adapt the aesthetic level of detail to the user's specific brand, colors, and niche.

--- TARGET OUTPUT TEMPLATE (Adapt all bracketed info and content to the User Inputs) ---

You are designing a landing page for ${data.name || '[Brand Name]'}, a ${data.niche || '[Niche]'}. Follow the design.json below as your design system guidelines. The overall aesthetic should feel premium, trustworthy, and modern. Follow instructions below for copy and landing page content.

design.json
{
"designPrinciples": {
"overall": "[Describe overall aesthetic based on image/niche]",
"keywords": ["[Keyword 1]", "[Keyword 2]", "[...]"],
"avoid": ["generic templates", "cluttered UI", "outdated layouts"]
},
"colorPalette": {
"primary": { "main": "[HEX]", "light": "[HEX]", "dark": "[HEX]" },
"neutral": { "white": "#FFFFFF", "black": "#1A1A1A", "custom": "[HEX]" },
"accent": { "main": "[HEX]", "secondary": "[HEX]" },
"usage": { "backgrounds": ["..."], "text": { "headings": "...", "body": "..." }, "buttons": { "primary": "...", "secondary": "..." } }
},
"typography": {
"fontFamilies": { "headings": { "family": "[Suggest Font based on image/niche]", "weight": "..." }, "body": { "family": "[Suggest Font]", "weight": "..." } },
"scale": { "hero-h1": { "size": "clamp(2.5rem, 5vw, 4rem)" }, "h2": { "size": "clamp(2rem, 4vw, 3rem)" }, "h3": { "size": "1.25rem" }, "body": { "size": "1rem" } }
},
"spacing": {
"philosophy": "Generous, breathing room. White space is a feature.",
"sectionPadding": { "vertical": "clamp(80px, 10vw, 140px)" }
},
"components": {
"buttons": { "primary": { "background": "[HEX]", "borderRadius": "...", "padding": "..." } },
"cards": { "default": { "background": "[HEX]", "borderRadius": "...", "shadow": "..." } }
},
"animations": {
"philosophy": "Subtle and purposeful.",
"microInteractions": { "buttons": "Scale 1.02 on hover", "cards": "Lift on hover" }
}
}

BRIEF: ${data.name || '[Brand Name]'} Landing Page
Create a premium landing page for ${data.name || '[Brand Name]'}. DESIGN SYSTEM REFERENCE: Use the design.json above as the definitive style guide.

SECTIONS:
[GENERATE THE SECTIONS HERE BASED ON THE USER'S SELECTION: ${data.sections.join(', ')}. Use the copy framework AIDA/PAS. Write the actual persuasive copy in Portuguese]

Section 1: [Section Name]

Layout: [e.g., 2 columns]

Background: [Color/HEX]

Content: [Specify H1/H2/Body text]

UI Components: [Specify components, e.g., Bento Grid, Floating WhatsApp Button]

[Continue generating the block above for EVERY section requested by the user...]

--- END OF TARGET OUTPUT TEMPLATE ---

OUTPUT FORMAT (JSON REQUIRED):
Return STRICTLY a JSON object. Do not format with markdown blocks outside the JSON. Return exactly:
{
"enhancedPrompt": "The FULL output text described in the TARGET OUTPUT TEMPLATE above (starting from 'You are designing a landing page...').",
"designJson": {
"colors": [
{ "name": "Primary", "hex": "#HEX" },
{ "name": "Accent", "hex": "#HEX" },
{ "name": "Background", "hex": "#HEX" }
],
"typography": { "headings": "...", "body": "..." },
"components": ["...", "..."]
}
}`;

  let finalContents: any;

  if (data.imageBase64) {
    finalContents = [
      { text: basePrompt },
      { 
        inlineData: {
          data: data.imageBase64,
          mimeType: data.imageMimeType
        }
      }
    ];
  } else {
    finalContents = basePrompt;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: finalContents,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });
    let resultText = response.text || "{}";
    
    // Safely remove markdown formatting if the model still includes it
    resultText = resultText.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
    
    return JSON.parse(resultText) as GenerationResult;
  } catch (error: any) {
    console.error('Erro no scraping/geração:', error);
    
    let errorMessage = 'Não foi possível acessar os links ou gerar o prompt. Verifique os dados inseridos.';
    if (error?.message) {
      if (error.message.includes('503') || error.message.includes('high demand') || error.message.includes('UNAVAILABLE')) {
        errorMessage = 'O modelo de IA está com alta demanda no momento (Erro 503). Por favor, aguarde alguns instantes e tente novamente.';
      } else {
        errorMessage = `Erro na geração: ${error.message}`;
      }
    } else if (typeof error === 'object' && error?.error?.code === 503) {
        errorMessage = 'O modelo de IA está com alta demanda no momento (Erro 503). Por favor, aguarde alguns instantes e tente novamente.';
    }
    
    throw new Error(errorMessage);
  }
}

export default function App() {
  const [formData, setFormData] = useState({ 
    name: '', niche: '', instagram: '', maps: '', whatsapp: '',
    vibe: '🤖 IA Automática', colors: '🎨 Extração Automática',
    audience: '', offer: '',
    customColors: ['#6366f1', '#a855f7'],
    sections: ['Botão WhatsApp', 'Serviços', 'Depoimentos'] as string[],
    imageBase64: '', imageMimeType: '',
    selectedVaultFiles: [] as any[]
  });
  const [customSection, setCustomSection] = useState('');
  const [availableSections, setAvailableSections] = useState([
     'Portfólio', 'Botão WhatsApp', 'Serviços', 'Localização Maps', 'Horários de Funcionamento', 'Depoimentos', 'FAQ'
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'prompt' | 'system' | 'json'>('prompt');
  
  // Vault state
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [vaultFiles, setVaultFiles] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isLoadingVault, setIsLoadingVault] = useState(false);

  useEffect(() => {
    fetchVaultFiles();
  }, []);

  const fetchVaultFiles = async () => {
    if (!supabase) return;
    setIsLoadingVault(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVaultFiles(data || []);
    } catch (err) {
      console.error('Error fetching vault:', err);
    } finally {
      setIsLoadingVault(false);
    }
  };

  const uploadFolderToVault = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!supabase) {
      alert('Configuração do Supabase ausente. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente.');
      return;
    }
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      let uploadedCount = 0;
      const totalCount = files.length;
      setUploadProgress(`Salvando arquivo 0 de ${totalCount}...`);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.webkitRelativePath || file.name;
        const projectName = fileName.split('/')[0] || 'Unknown Project';

        setUploadProgress(`Salvando arquivo ${i + 1} de ${totalCount}...`);

        if (file.name.match(/\.(json|tsx|ts|jsx|js|css|txt|md|html)$/i)) {
          const text = await file.text();
          await supabase.from('knowledge_base').insert([
            {
              project_name: projectName,
              file_name: fileName,
              file_type: 'code',
              content: text
            }
          ]);
        } else if (file.name.match(/\.(png|jpg|jpeg|svg|webp|gif)$/i)) {
          const timestamp = new Date().getTime();
          const storagePath = `${projectName}/${timestamp}_${file.name}`;
          
          const { data, error } = await supabase.storage
            .from('brand_assets')
            .upload(storagePath, file);

          if (data) {
            const { data: { publicUrl } } = supabase.storage
              .from('brand_assets')
              .getPublicUrl(storagePath);

            await supabase.from('knowledge_base').insert([
              {
                project_name: projectName,
                file_name: fileName,
                file_type: 'image',
                url: publicUrl
              }
            ]);
          }
        }
        uploadedCount++;
      }
      setUploadProgress('');
      fetchVaultFiles();
    } catch (err: any) {
      console.error('Upload failed', err);
      setUploadProgress(`Erro no upload: ${err.message}`);
      setTimeout(() => setUploadProgress(''), 3000);
    }
  };

  const toggleVaultFile = (file: any) => {
    setFormData(prev => {
      const isSelected = prev.selectedVaultFiles.some(f => f.id === file.id);
      if (isSelected) {
        return { ...prev, selectedVaultFiles: prev.selectedVaultFiles.filter(f => f.id !== file.id) };
      } else {
        return { ...prev, selectedVaultFiles: [...prev.selectedVaultFiles, file] };
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const [meta, base64] = base64String.split(',');
        const mimeType = meta.split(':')[1].split(';')[0];
        
        setFormData(prev => ({
          ...prev,
          imageBase64: base64,
          imageMimeType: mimeType
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setIsGenerating(true);
    setResult(null);
    setActiveTab('prompt');
    
    try {
      const dataToPass = {
        ...formData,
        colors: formData.colors === 'Personalizada' ? `Personalizada: ${formData.customColors.join(', ')}` : formData.colors,
        vaultReferences: formData.selectedVaultFiles
      };
      const generated = await generateCroPrompt(dataToPass);
      setResult(generated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSection = (section: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.includes(section) 
        ? prev.sections.filter(s => s !== section)
        : [...prev.sections, section]
    }));
  };

  const addCustomSection = () => {
    if (customSection.trim() && !availableSections.includes(customSection.trim())) {
      const newSection = customSection.trim();
      setAvailableSections(prev => [...prev, newSection]);
      setFormData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
      setCustomSection('');
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.enhancedPrompt);
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
          <button 
            onClick={() => setIsVaultOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors"
          >
            <Database className="w-4 h-4" />
            Knowledge Vault
          </button>
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
                    <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="Ex: Acme Corp" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Nicho / Vertical</label>
                    <input type="text" value={formData.niche} onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" placeholder="Ex: SaaS B2B" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="col-span-1 md:col-span-2 relative group">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-emerald-400" /> WhatsApp
                      </label>
                      <input type="text" value={formData.whatsapp} onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="Ex: (11) 99999-9999" />
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-pink-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-1.5">
                        <Instagram className="w-3 h-3 text-pink-400" /> Link Instagram
                        <div className="ml-auto text-[8px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1 hidden sm:flex">
                          <Wand2 className="w-2 h-2" /> SCRAPER TARGET
                        </div>
                      </label>
                      <input type="text" value={formData.instagram} onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" placeholder="Ex: @acmecorp" />
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-red-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-red-500" /> Link Google Maps
                        <div className="ml-auto text-[8px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1 hidden sm:flex">
                          <Wand2 className="w-2 h-2" /> SCRAPER TARGET
                        </div>
                      </label>
                      <input type="text" value={formData.maps} onChange={(e) => setFormData(prev => ({ ...prev, maps: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors" placeholder="Ex: maps.app.goo.gl/..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 1.5: Image Reference and Vault */}
              <div className="space-y-4 pt-2">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 border-b border-slate-800 pb-2 mb-4">Referências Adicionais</div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-indigo-400 mb-2 ml-1 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> 📚 Referências do Vault
                  </label>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar">
                    {vaultFiles.length === 0 ? (
                      <div className="text-xs text-slate-500 text-center py-4">Nenhum arquivo no cofre.</div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {vaultFiles.map(file => (
                          <label key={file.id} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={formData.selectedVaultFiles.some(f => f.id === file.id)}
                              onChange={() => toggleVaultFile(file)}
                              className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <div className="flex-1 truncate">
                              <p className="text-xs text-slate-300 group-hover:text-indigo-300 transition-colors truncate">{file.file_name}</p>
                              <p className="text-[10px] text-slate-500">{file.project_name} - {file.file_type}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-1.5">
                    <ImageIcon className="w-3 h-3 text-indigo-400" /> Upload de Imagem (Screenshot / Design)
                  </label>
                  {!formData.imageBase64 ? (
                    <div className="relative border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/50 hover:bg-slate-900/50 transition-colors p-4 flex flex-col items-center justify-center cursor-pointer">
                      <ImageIcon className="w-6 h-6 text-slate-500 mb-2" />
                      <span className="text-xs text-slate-400 font-medium text-center">Clique para fazer upload ou arraste uma imagem</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  ) : (
                     <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 p-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded bg-slate-800 overflow-hidden flex-shrink-0">
                             <img src={`data:${formData.imageMimeType};base64,${formData.imageBase64}`} className="w-full h-full object-cover" alt="Preview" />
                           </div>
                           <span className="text-xs text-emerald-400 font-medium">Imagem Carregada</span>
                        </div>
                        <button 
                          type="button" 
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors bg-slate-950 rounded-lg"
                          onClick={() => setFormData(p => ({...p, imageBase64: '', imageMimeType: ''}))}
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  )}
                </div>
              </div>

              {/* Group 2: Strategy */}
              <div className="space-y-4 pt-2">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 border-b border-slate-800 pb-2 mb-4">2. Copywriting Strategy</div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-indigo-400" /> Persona Alvo Detalhada
                  </label>
                  <textarea 
                    value={formData.audience} 
                    onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))} 
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none min-h-[80px]" 
                    placeholder="Especifique quem é o comprador (ex: Idade, Interesses, Classe Social, Comportamento)" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-1.5">
                    <Gift className="w-3 h-3 text-emerald-400" /> Oferta Irresistível (Hook)
                  </label>
                  <input type="text" value={formData.offer} onChange={(e) => setFormData(prev => ({ ...prev, offer: e.target.value }))} className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="Diagnóstico gratuito + eBook" />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-indigo-400 mb-2 ml-1 flex items-center gap-1.5">
                    <CheckSquare className="w-3 h-3" /> Arquitetura do Site (Seções)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {availableSections.map((section) => {
                      const isSelected = formData.sections.includes(section);
                      return (
                        <button
                          type="button"
                          key={section}
                          onClick={() => toggleSection(section)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1.5 ${
                            isSelected 
                              ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3 h-3" />}
                          {section}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={customSection}
                      onChange={(e) => setCustomSection(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomSection();
                        }
                      }}
                      className="flex-grow bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors" 
                      placeholder="Adicionar customizada..." 
                    />
                    <button
                      type="button"
                      onClick={addCustomSection}
                      disabled={!customSection.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-3 py-2 flex items-center justify-center transition-colors shadow-lg shadow-indigo-500/20 disabled:shadow-none"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
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
                          className={`cursor-pointer p-3 rounded-xl border transition-all flex flex-col gap-3 ${
                            formData.vibe === vibe.id 
                              ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {vibe.preview}
                          <div>
                            <div className={`text-xs font-bold mb-0.5 ${formData.vibe === vibe.id ? 'text-indigo-400' : 'text-slate-300'}`}>
                              {vibe.id}
                            </div>
                            <div className="text-[9px] text-slate-500 leading-tight">
                              {vibe.desc}
                            </div>
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
                             {palette.colors.length > 0 ? palette.colors.map((color, idx) => (
                               <div 
                                 key={idx} 
                                 className="w-4 h-4 rounded-full border border-slate-800 shadow-sm"
                                 style={{ backgroundColor: color }}
                               />
                             )) : (
                               <div className="w-5 h-5 rounded flex items-center justify-center bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                 <Wand2 className="w-3 h-3" />
                               </div>
                             )}
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
                  <button 
                    onClick={() => setActiveTab('json')}
                    className={`pb-3 text-xs tracking-widest uppercase font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'json' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    Extracted JSON
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
                    {result.enhancedPrompt}
                  </motion.div>
                )}

                {!isGenerating && result && activeTab === 'json' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-[11px] leading-relaxed text-indigo-300 bg-slate-950 p-6 rounded-2xl border border-slate-800 overflow-x-auto w-full"
                  >
                    <pre><code>{JSON.stringify(result.designJson, null, 2)}</code></pre>
                  </motion.div>
                )}

                {!isGenerating && result && activeTab === 'system' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto space-y-12 pb-8"
                  >
                    {/* Colors */}
                    {result.designJson?.colors && Array.isArray(result.designJson.colors) ? (
                      <section>
                         <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-6">
                           <Palette className="w-5 h-5 text-indigo-400" />
                           <h3 className="text-lg font-bold text-white tracking-wide">Color Foundation</h3>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {result.designJson.colors.map((c: any, i: number) => (
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
                    ) : (
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-sm text-center">
                        Nenhuma paleta estruturada encontrada. Verifique a aba Extracted JSON.
                      </div>
                    )}

                    {/* Typography */}
                    {result.designJson?.typography && typeof result.designJson.typography === 'object' && (
                      <section>
                         <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-6">
                           <div className="w-5 h-5 text-indigo-400 flex items-center justify-center font-serif text-lg leading-none">Aa</div>
                           <h3 className="text-lg font-bold text-white tracking-wide">Typography Hierarchy</h3>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                               <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Headings & Display</div>
                               <div className="text-3xl text-white mb-2" style={{ fontFamily: result.designJson.typography.headings }}>
                                 Aestetica Magna
                               </div>
                               <div className="text-xs font-mono text-indigo-400">{result.designJson.typography.headings}</div>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
                               <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Body & UI Text</div>
                               <p className="text-sm text-slate-300 mb-4 leading-relaxed" style={{ fontFamily: result.designJson.typography.body }}>
                                 Good design is making something intelligible and memorable. Great design is making something memorable and meaningful.
                               </p>
                               <div className="text-xs font-mono text-indigo-400 mt-auto">{result.designJson.typography.body}</div>
                            </div>
                         </div>
                      </section>
                    )}

                    {/* Components */}
                    {result.designJson?.components && Array.isArray(result.designJson.components) && (
                      <section>
                         <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-6">
                           <Layers className="w-5 h-5 text-indigo-400" />
                           <h3 className="text-lg font-bold text-white tracking-wide">UI Architecture Elements</h3>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {result.designJson.components.map((comp: any, i: number) => (
                               <div key={i} className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
                                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                    <span className="text-indigo-400 font-mono text-[10px] font-bold">0{i+1}</span>
                                  </div>
                                  <span className="text-sm text-slate-200 font-medium">{comp}</span>
                               </div>
                            ))}
                         </div>
                      </section>
                    )}
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

      {/* Vault Modal Overlay */}
      <AnimatePresence>
        {isVaultOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-8"
            onClick={() => setIsVaultOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                    <Database className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Knowledge Vault</h2>
                    <p className="text-xs text-slate-400">Gerencie referências, design systems e snippets de código.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsVaultOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                
                {/* Upload Section */}
                <div className="bg-slate-950/50 border border-slate-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center relative group hover:bg-slate-950 hover:border-indigo-500/50 transition-colors">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-200 mb-2">Upload Folder (Projeto Completo)</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                    Selecione uma pasta contendo código, assets e design.json. Faremos a leitura de tudo de forma inteligente.
                  </p>
                  
                  <div className="relative overflow-hidden inline-block">
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2 relative z-0">
                      <Plus className="w-4 h-4" />
                      Selecionar Pasta
                    </button>
                    <input 
                      type="file" 
                      // @ts-ignore - webkitdirectory is non-standard but supported by most browsers
                      webkitdirectory="true" 
                      directory="true" 
                      multiple 
                      onChange={uploadFolderToVault}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>

                  {uploadProgress && (
                    <div className="mt-4 text-xs font-medium text-indigo-400 animate-pulse bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20">
                      {uploadProgress}
                    </div>
                  )}
                </div>

                {/* File List */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-400" />
                    Arquivos Armazenados
                  </h4>
                  
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    {isLoadingVault ? (
                      <div className="p-8 flex justify-center">
                        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                      </div>
                    ) : vaultFiles.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">
                        O cofre está vazio. Faça upload de projetos para alimentar a IA.
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-900/50">
                            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-medium">Projeto</th>
                            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-medium">Arquivo</th>
                            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-medium">Tipo</th>
                            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vaultFiles.map((file) => (
                            <tr key={file.id} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                              <td className="px-4 py-3 text-xs text-slate-300 font-medium">{file.project_name}</td>
                              <td className="px-4 py-3 text-xs text-slate-400 truncate max-w-[200px]">{file.file_name}</td>
                              <td className="px-4 py-3 text-xs">
                                <span className={`px-2 py-0.5 rounded uppercase font-bold text-[9px] ${
                                  file.file_type === 'image' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                  file.file_type === 'code' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                  'bg-slate-800 text-slate-400'
                                }`}>
                                  {file.file_type}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button 
                                  onClick={async () => {
                                    if (!supabase) return;
                                    await supabase.from('knowledge_base').delete().eq('id', file.id);
                                    fetchVaultFiles();
                                  }}
                                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
