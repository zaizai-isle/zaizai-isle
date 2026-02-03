"use client";

import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { useLanguage } from "@/lib/language-context";
import { Upload, Download, Image as ImageIcon, Bot, Zap, Cpu, RotateCcw, Palette, Smile, Sparkle, Sailboat, Drill, MessageSquareCode, CloudLightning, Database, FileText, Send, Workflow, MoreHorizontal, Plus } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import imageCompression from "browser-image-compression";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { createPortal } from "react-dom";

// Presence Levels configuration
const PRESENCE_THRESHOLDS = {
  ACTIVE: 7 * 24 * 60 * 60 * 1000, // 7 days
  QUIET: 30 * 24 * 60 * 60 * 1000, // 30 days
  RETREAT: 60 * 24 * 60 * 60 * 1000, // 60 days
};

type ToolId = 'chatgpt' | 'claude' | 'midjourney' | 'figma' | 'gemini' | 'huggingface' | 'ollama' | 'comfyui' | 'cloudflare' | 'postman' | 'supabase' | 'notion';

interface ToolConfig {
  id: ToolId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  color: string;
  bg: string;
  defaultActive?: boolean; // If true, starts as active even without history
}

const ALL_TOOLS: ToolConfig[] = [
  // Existing Tools (Default Active)
  { id: 'chatgpt', name: "ChatGPT", icon: Bot, url: "https://chat.openai.com", color: "text-emerald-400", bg: "bg-[#0f1c36] hover:bg-[#1a2f55] border-white/10", defaultActive: true },
  { id: 'claude', name: "Claude", icon: MessageSquareCode, url: "https://claude.ai", color: "text-orange-400", bg: "bg-[#2d0e36] hover:bg-[#4a1859] border-white/10", defaultActive: true },
  { id: 'midjourney', name: "Midjourney", icon: Sailboat, url: "https://www.midjourney.com", color: "text-blue-400", bg: "bg-[#09073a] hover:bg-[#151269] border-white/10", defaultActive: true },
  { id: 'figma', name: "Figma", icon: Palette, url: "https://www.figma.com", color: "text-cyan-400", bg: "bg-[#183138] hover:bg-[#234650] border-white/10", defaultActive: true },
  { id: 'gemini', name: "Gemini", icon: Sparkle, url: "https://gemini.google.com", color: "text-indigo-400", bg: "bg-[#0e1f33] hover:bg-[#1a2f55] border-white/10", defaultActive: true },
  { id: 'huggingface', name: "HuggingFace", icon: Smile, url: "https://huggingface.co", color: "text-yellow-400", bg: "bg-[#2d2b0e] hover:bg-[#4a4718] border-white/10", defaultActive: true },
  
  // New Tools (Start in Retreat/Vanished)
  { id: 'ollama', name: "Ollama", icon: Cpu, url: "https://ollama.com", color: "text-white", bg: "bg-[#202020] hover:bg-[#303030] border-white/10" },
  { id: 'comfyui', name: "ComfyUI", icon: Workflow, url: "https://github.com/comfyanonymous/ComfyUI", color: "text-purple-400", bg: "bg-[#1a103c] hover:bg-[#2a1b55] border-white/10" },
  { id: 'cloudflare', name: "Cloudflare", icon: CloudLightning, url: "https://dash.cloudflare.com", color: "text-orange-500", bg: "bg-[#2a1a0f] hover:bg-[#422a18] border-white/10" },
  { id: 'postman', name: "Postman", icon: Send, url: "https://www.postman.com", color: "text-orange-400", bg: "bg-[#2a1505] hover:bg-[#422208] border-white/10" },
  { id: 'supabase', name: "Supabase", icon: Database, url: "https://supabase.com", color: "text-emerald-500", bg: "bg-[#0f2a1b] hover:bg-[#18422b] border-white/10" },
  { id: 'notion', name: "Notion", icon: FileText, url: "https://www.notion.so", color: "text-white", bg: "bg-[#202020] hover:bg-[#303030] border-white/10" },
];

export function ToolsCard() {
  const { t } = useLanguage();
  
  // Image Compressor State
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tools Presence State
  // Map of ToolId -> lastUsed timestamp
  const [toolsUsage, setToolsUsage] = useState<Record<string, number>>({});
  const [isClient, setIsClient] = useState(false);
  const [showAllToolsModal, setShowAllToolsModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load from localStorage
    const savedUsage = localStorage.getItem('tools_presence_v1');
    if (savedUsage) {
      setToolsUsage(JSON.parse(savedUsage));
    } else {
      // Initialize default active tools
      const initialUsage: Record<string, number> = {};
      const now = Date.now();
      ALL_TOOLS.forEach(tool => {
        if (tool.defaultActive) {
          initialUsage[tool.id] = now;
        } else {
          // New tools start old (Retreat state: 30-60 days old)
          // We set them to just past the QUIET threshold (30 days)
          initialUsage[tool.id] = now - PRESENCE_THRESHOLDS.QUIET - (24 * 60 * 60 * 1000); 
        }
      });
      setToolsUsage(initialUsage);
      localStorage.setItem('tools_presence_v1', JSON.stringify(initialUsage));
    }
  }, []);

  const updateToolUsage = (id: string) => {
    const newUsage = { ...toolsUsage, [id]: Date.now() };
    setToolsUsage(newUsage);
    localStorage.setItem('tools_presence_v1', JSON.stringify(newUsage));
  };

  const getToolPresence = (lastUsed: number) => {
    const now = Date.now();
    const diff = now - lastUsed;
    
    if (diff < PRESENCE_THRESHOLDS.ACTIVE) return 'active';
    if (diff < PRESENCE_THRESHOLDS.QUIET) return 'quiet';
    if (diff < PRESENCE_THRESHOLDS.RETREAT) return 'retreat';
    return 'vanished';
  };

  const { activeTools, quietTools, retreatTools, vanishedTools } = useMemo(() => {
    const active: ToolConfig[] = [];
    const quiet: ToolConfig[] = [];
    const retreat: ToolConfig[] = [];
    const vanished: ToolConfig[] = [];

    if (!isClient) return { activeTools: ALL_TOOLS.filter(t => t.defaultActive), quietTools: [], retreatTools: [], vanishedTools: [] };

    ALL_TOOLS.forEach(tool => {
      const lastUsed = toolsUsage[tool.id] || 0;
      const presence = getToolPresence(lastUsed);

      if (presence === 'active') active.push(tool);
      else if (presence === 'quiet') quiet.push(tool);
      else if (presence === 'retreat') retreat.push(tool);
      else vanished.push(tool);
    });

    return { activeTools: active, quietTools: quiet, retreatTools: retreat, vanishedTools: vanished };
  }, [toolsUsage, isClient]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = event.target.files?.[0];
    if (!imageFile) return;
    
    setFile(imageFile);
    setIsCompressing(true);
    
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };
    
    try {
      const compressedBlob = await imageCompression(imageFile, options);
      const compressed = new File([compressedBlob], imageFile.name, {
        type: imageFile.type,
        lastModified: Date.now(),
      });
      setCompressedFile(compressed);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setCompressedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = () => {
    if (!compressedFile) return;
    const url = URL.createObjectURL(compressedFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = `compressed_${compressedFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatSize = (size: number) => {
    return (size / 1024 / 1024).toFixed(2) + " MB";
  };

  // Render helper for tools
  const renderTool = (tool: ToolConfig, isQuiet: boolean = false) => (
    <a
      key={tool.id}
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => updateToolUsage(tool.id)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all group relative overflow-hidden",
        tool.bg,
        isQuiet && "opacity-40 hover:opacity-100 grayscale-[0.3] hover:grayscale-0 scale-95 hover:scale-100"
      )}
    >
      <tool.icon className={cn("w-5 h-5 transition-transform duration-300", tool.color, isQuiet && "scale-90 group-hover:scale-110")} />
      <span className="text-sm text-white/80 group-hover:text-white transition-colors">
        {tool.name}
      </span>
      {isQuiet && (
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors pointer-events-none" />
      )}
    </a>
  );

  return (
    <BentoCard
      colSpan={4}
      rowSpan={1}
      className="flex flex-col md:flex-row gap-6 p-6 bg-[#314062]/80 hover:bg-[#3b4b6f]/80 backdrop-blur-2xl shadow-xl overflow-visible"
      borderGradient={VERTICAL_BORDER_GRADIENT}
    >
      {/* Header for Mobile */}
      <div className="md:hidden mb-2">
        <h3 className="text-[18px] font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          {t('tools.title')}
        </h3>
      </div>

      {/* Left: Image Compressor */}
      <div className="w-full md:w-[25%] flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          <ImageIcon className="w-5 h-5 text-blue-400" />
          <h4 className="font-medium text-white/90">{t('tools.compressor.title')}</h4>
        </div>
        
        <div className="flex-1 relative group min-h-[104px]">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "h-full rounded-xl transition-colors cursor-pointer flex flex-col items-center justify-center p-4 text-center bg-black/20 hover:bg-black/30 border border-white/5 hover:border-white/10",
              isCompressing && "animate-pulse"
            )}
          >
            {isCompressing ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <p className="text-xs text-white/60">{t('tools.compressor.compressing')}</p>
              </div>
            ) : compressedFile ? (
              <div className="w-full flex items-center justify-between gap-2">
                <div className="text-left min-w-0 flex-1">
                  <p className="text-[10px] text-white/40 mb-1">{t('tools.compressor.original')}</p>
                  <p className="text-xs font-medium text-white/80 truncate">{file?.name}</p>
                  <p className="text-[10px] text-white/60">{file && formatSize(file.size)}</p>
                </div>
                
                <div className="h-8 w-[1px] bg-white/10 flex-shrink-0" />
                
                <div className="text-right min-w-0 flex-1">
                  <p className="text-[10px] text-emerald-400 mb-1">{t('tools.compressor.compressed')}</p>
                  <p className="text-xs font-bold text-emerald-400">-{file && compressedFile && ((1 - compressedFile.size / file.size) * 100).toFixed(0)}%</p>
                  <p className="text-[10px] text-emerald-400/80">{formatSize(compressedFile.size)}</p>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={handleReset}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    title={t('tools.compressor.reset')}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                    className="p-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-full text-white transition-colors"
                    title="Download compressed image"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
                <Upload className="w-6 h-6 mb-1" />
                <p className="text-xs">{t('tools.compressor.drop')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      {/* Right: AI Hub */}
      <div className="flex-1 flex flex-col gap-4 relative">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Drill className="w-5 h-5 text-purple-400" />
            <h4 className="font-medium text-white/90">{t('tools.ai.title')}</h4>
          </div>
          {(activeTools.length + quietTools.length > 8 || retreatTools.length > 0 || vanishedTools.length > 0) && (
             <button 
               onClick={() => setShowAllToolsModal(true)}
               className="p-1.5 rounded-lg transition-colors flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5"
               title="More Tools"
             >
               <MoreHorizontal className="w-4 h-4" />
             </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...activeTools, ...quietTools].slice(0, 8).map(tool => 
            renderTool(tool, quietTools.includes(tool))
          )}
        </div>

        {/* All Tools Modal (Portal) */}
        {isClient && createPortal(
          <AnimatePresence>
            {showAllToolsModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAllToolsModal(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="relative w-full max-w-lg bg-[#1a2336] border border-white/10 rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto z-10"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">All Tools Repository</h3>
                    <button onClick={() => setShowAllToolsModal(false)} className="text-white/40 hover:text-white">
                      <Plus className="w-5 h-5 rotate-45" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {[
                      { title: "Active & Quiet", tools: [...activeTools, ...quietTools] },
                      { title: "Retreat (Hidden)", tools: retreatTools },
                      { title: "Vanished (Archived)", tools: vanishedTools }
                    ].map((section) => section.tools.length > 0 && (
                      <div key={section.title}>
                        <h4 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wider">{section.title}</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {section.tools.map(tool => (
                            <div 
                              key={tool.id}
                              className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5"
                            >
                              <tool.icon className={cn("w-5 h-5", tool.color)} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-white/90 font-medium">{tool.name}</div>
                                <div className="text-[10px] text-white/40">
                                  {getToolPresence(toolsUsage[tool.id] || 0).toUpperCase()}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  updateToolUsage(tool.id);
                                  // Optional: close modal if restoring from vanished
                                  if (getToolPresence(toolsUsage[tool.id] || 0) === 'vanished') {
                                    setShowAllToolsModal(false);
                                  }
                                }}
                                className="p-1.5 hover:bg-white/10 rounded-full text-emerald-400 transition-colors"
                                title="Restore / Use"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </BentoCard>
  );
}
