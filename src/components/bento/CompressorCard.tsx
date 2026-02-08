"use client";

import { BentoCard, VERTICAL_BORDER_GRADIENT } from "./BentoCard";
import { useLanguage } from "@/lib/language-context";
import { Upload, Download, Image as ImageIcon, RotateCcw } from "lucide-react";
import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { cn } from "@/lib/utils";
import { BentoHeader } from "./BentoCommon";

export function CompressorCard() {
    const { t } = useLanguage();
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

    return (
        <BentoCard
            colSpan={2}
            rowSpan={1}
            theme="dark"
            borderGradient={VERTICAL_BORDER_GRADIENT}
        >
            <BentoHeader
                icon={ImageIcon}
                title={t('tools.compressor.title')}
                iconColor="text-blue-400"
            />

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
                        "h-full min-h-[104px] rounded-xl transition-colors cursor-pointer flex flex-col items-center justify-center p-4 text-center bg-black/5 hover:bg-black/10 border border-white/5 hover:border-white/10",
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
                                <p className="text-xs text-white/40 mb-1">{t('tools.compressor.original')}</p>
                                <p className="text-sm font-medium text-white/80 truncate">{file?.name}</p>
                                <p className="text-xs text-white/60">{file && formatSize(file.size)}</p>
                            </div>

                            <div className="h-8 w-[1px] bg-white/10 flex-shrink-0" />
                            <div className="flex gap-2 pl-1 items-center justify-between flex-shrink-0">
                                <div className="text-right min-w-0 flex-1">
                                    <p className="text-xs text-emerald-400 mb-1">{t('tools.compressor.compressed')}</p>
                                    <p className="text-sm font-bold text-emerald-400">-{file && compressedFile && ((1 - compressedFile.size / file.size) * 100).toFixed(0)}%</p>
                                    <p className="text-xs text-emerald-400/80">{formatSize(compressedFile.size)}</p>
                                </div>

                                <div className="flex gap-2 h-7 items-center justify-between flex-shrink-0">
                                    <button
                                        onClick={handleReset}
                                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload();
                                        }}
                                        className="p-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-full text-white transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                </div>
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
        </BentoCard>
    );
}
