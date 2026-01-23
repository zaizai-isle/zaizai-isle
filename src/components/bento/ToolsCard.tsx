"use client";

import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { useLanguage } from "@/lib/language-context";
import { Upload, Download, Image as ImageIcon, Sparkles, Bot, Brain, Zap, Cpu, RotateCcw, MessageSquare, Palette, Smile, Sparkle, Sailboat, Drill, MessageSquareCode } from "lucide-react";
import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ToolsCard() {
  const { t } = useLanguage();
  
  // Image Compressor State
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const aiTools = [
    { name: "ChatGPT", icon: Bot, url: "https://chat.openai.com", color: "text-emerald-400", bg: "bg-[#0f1c36] hover:bg-[#1a2f55] border-white/10" },
    { name: "Claude", icon: MessageSquareCode, url: "https://claude.ai", color: "text-orange-400", bg: "bg-[#2d0e36] hover:bg-[#4a1859] border-white/10" },
    { name: "Midjourney", icon: Sailboat, url: "https://www.midjourney.com", color: "text-blue-400", bg: "bg-[#09073a] hover:bg-[#151269] border-white/10" },
    { name: "Perplexity", icon: Brain, url: "https://www.perplexity.ai", color: "text-cyan-400", bg: "bg-[#183138] hover:bg-[#234650] border-white/10" },
    { name: "Gemini", icon: Sparkle, url: "https://gemini.google.com", color: "text-indigo-400", bg: "bg-[#0e1f33] hover:bg-[#1a2f55] border-white/10" },
    { name: "HuggingFace", icon: Smile, url: "https://huggingface.co", color: "text-yellow-400", bg: "bg-[#2d2b0e] hover:bg-[#4a4718] border-white/10" },
  ];

  return (
    <BentoCard
      colSpan={4}
      rowSpan={1}
      className="flex flex-col md:flex-row gap-6 p-6 bg-[#314062]/80 hover:bg-[#3b4b6f]/80 backdrop-blur-2xl shadow-xl"
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
        
        <div className="flex-1 relative group">
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
              "h-full rounded-xl transition-colors cursor-pointer flex flex-col items-center justify-center p-4 text-center bg-black/20 hover:bg-black/30",
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
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          <Drill className="w-5 h-5 text-purple-400" />
          <h4 className="font-medium text-white/90">{t('tools.ai.title')}</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-full">
          {aiTools.map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all group",
                tool.bg
              )}
            >
              <tool.icon className={cn("w-5 h-5", tool.color)} />
              <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                {tool.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </BentoCard>
  );
}
