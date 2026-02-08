"use client";

import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { useLanguage } from "@/lib/language-context";
import { Bot, Cpu, Palette, Smile, Sparkle, Sailboat, Drill, MessageSquareCode, CloudLightning, Database, FileText, Send, Workflow, MoreHorizontal, Plus, RotateCcw } from "lucide-react";
import { BentoHeader } from "./BentoCommon";
import { useState, useEffect, useMemo } from "react";
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
    defaultActive?: boolean;
}

const ALL_TOOLS: ToolConfig[] = [
    { id: 'chatgpt', name: "ChatGPT", icon: Bot, url: "https://chat.openai.com", color: "text-emerald-400", bg: "bg-[#0f1c36] hover:bg-[#1a2f55] border-white/10", defaultActive: true },
    { id: 'claude', name: "Claude", icon: MessageSquareCode, url: "https://claude.ai", color: "text-orange-400", bg: "bg-[#2d0e36] hover:bg-[#4a1859] border-white/10", defaultActive: true },
    { id: 'midjourney', name: "Midjourney", icon: Sailboat, url: "https://www.midjourney.com", color: "text-blue-400", bg: "bg-[#09073a] hover:bg-[#151269] border-white/10", defaultActive: true },
    { id: 'figma', name: "Figma", icon: Palette, url: "https://www.figma.com", color: "text-cyan-400", bg: "bg-[#183138] hover:bg-[#234650] border-white/10", defaultActive: true },
    { id: 'gemini', name: "Gemini", icon: Sparkle, url: "https://gemini.google.com", color: "text-indigo-400", bg: "bg-[#0e1f33] hover:bg-[#1a2f55] border-white/10", defaultActive: true },
    { id: 'huggingface', name: "HuggingFace", icon: Smile, url: "https://huggingface.co", color: "text-yellow-400", bg: "bg-[#2d2b0e] hover:bg-[#4a4718] border-white/10", defaultActive: true },
    { id: 'ollama', name: "Ollama", icon: Cpu, url: "https://ollama.com", color: "text-white", bg: "bg-[#202020] hover:bg-[#303030] border-white/10" },
    { id: 'comfyui', name: "ComfyUI", icon: Workflow, url: "https://github.com/comfyanonymous/ComfyUI", color: "text-purple-400", bg: "bg-[#1a103c] hover:bg-[#2a1b55] border-white/10" },
    { id: 'cloudflare', name: "Cloudflare", icon: CloudLightning, url: "https://dash.cloudflare.com", color: "text-orange-500", bg: "bg-[#2a1a0f] hover:bg-[#422a18] border-white/10" },
    { id: 'postman', name: "Postman", icon: Send, url: "https://www.postman.com", color: "text-orange-400", bg: "bg-[#2a1505] hover:bg-[#422208] border-white/10" },
    { id: 'supabase', name: "Supabase", icon: Database, url: "https://supabase.com", color: "text-emerald-500", bg: "bg-[#0f2a1b] hover:bg-[#18422b] border-white/10" },
    { id: 'notion', name: "Notion", icon: FileText, url: "https://www.notion.so", color: "text-white", bg: "bg-[#202020] hover:bg-[#303030] border-white/10" },
];

export function AIHubCard() {
    const { t } = useLanguage();
    const [toolsUsage, setToolsUsage] = useState<Record<string, number>>({});
    const [isClient, setIsClient] = useState(false);
    const [showAllToolsModal, setShowAllToolsModal] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const savedUsage = localStorage.getItem('tools_presence_v1');
        if (savedUsage) {
            setToolsUsage(JSON.parse(savedUsage));
        } else {
            const initialUsage: Record<string, number> = {};
            const now = Date.now();
            ALL_TOOLS.forEach(tool => {
                if (tool.defaultActive) initialUsage[tool.id] = now;
                else initialUsage[tool.id] = now - PRESENCE_THRESHOLDS.QUIET - 86400000;
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
        </a>
    );

    return (
        <BentoCard
            colSpan={4}
            rowSpan={1}
            theme="dark"
            className="p-5 overflow-visible"
            borderGradient={VERTICAL_BORDER_GRADIENT}
        >
            <div className="flex flex-col gap-3 h-full relative">
                <div className="flex items-center justify-between mb-1">
                    <BentoHeader
                        icon={Drill}
                        title={t('tools.ai.title')}
                        iconColor="text-purple-400"
                        className="mb-0"
                    />
                    {(activeTools.length + quietTools.length > 8 || retreatTools.length > 0 || vanishedTools.length > 0) && (
                        <button
                            onClick={() => setShowAllToolsModal(true)}
                            className="p-1.5 rounded-lg transition-colors flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5"
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

                {isClient && createPortal(
                    <AnimatePresence>
                        {showAllToolsModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAllToolsModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-5 max-h-[80vh] overflow-y-auto z-10" >
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-white">All Tools Repository</h3>
                                        <button onClick={() => setShowAllToolsModal(false)} className="text-white/40 hover:text-white"><Plus className="w-5 h-5 rotate-45" /></button>
                                    </div>
                                    <div className="space-y-6">
                                        {[{ title: "Active & Quiet", tools: [...activeTools, ...quietTools] }, { title: "Retreat (Hidden)", tools: retreatTools }, { title: "Vanished (Archived)", tools: vanishedTools }].map((section) => section.tools.length > 0 && (
                                            <div key={section.title}>
                                                <h4 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wider">{section.title}</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {section.tools.map(tool => (
                                                        <div key={tool.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5">
                                                            <tool.icon className={cn("w-5 h-5", tool.color)} />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm text-white/90 font-medium">{tool.name}</div>
                                                                <div className="text-[10px] text-white/40">{getToolPresence(toolsUsage[tool.id] || 0).toUpperCase()}</div>
                                                            </div>
                                                            <button onClick={() => updateToolUsage(tool.id)} className="p-1.5 hover:bg-white/10 rounded-full text-emerald-400 transition-colors"><RotateCcw className="w-4 h-4" /></button>
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
