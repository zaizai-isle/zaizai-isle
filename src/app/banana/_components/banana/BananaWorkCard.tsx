'use client';

import { useState, useRef } from 'react';
import { Heart, Download, Share2, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ShareDialog } from './ShareDialog';
import { toast } from 'sonner';
import type { BananaWork } from '@/lib/types/banana';
import { incrementLikes } from '@/lib/db/bananaApi';

interface BananaWorkCardProps {
  work: BananaWork;
  onLikeUpdate?: () => void;
}

export function BananaWorkCard({ work, onLikeUpdate }: BananaWorkCardProps) {
  const [likes, setLikes] = useState(work.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 全屏模式的滑块状态
  const [fullscreenSliderPosition, setFullscreenSliderPosition] = useState(50);
  const [isFullscreenDragging, setIsFullscreenDragging] = useState(false);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      await incrementLikes(work.id);
      setLikes((prev) => prev + 1);
      toast.success('点赞成功');
      onLikeUpdate?.();
    } catch (error) {
      console.error('点赞失败:', error);
      toast.error('点赞失败，请稍后重试');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = work.banana_image_url;
    link.download = `banana_work_${work.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('下载成功');
  };

  const handleImageClick = () => {
    // 如果刚刚发生了拖动，不触发全屏
    if (hasDragged) {
      setHasDragged(false);
      return;
    }
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setHasDragged(false); // 重置拖动标志
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
    setHasDragged(true); // 标记发生了拖动
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setHasDragged(false); // 重置拖动标志
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
    setHasDragged(true); // 标记发生了拖动
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 全屏模式的事件处理
  const handleFullscreenMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreenDragging(true);
  };

  const handleFullscreenMouseMove = (e: React.MouseEvent) => {
    if (!isFullscreenDragging || !fullscreenContainerRef.current) return;
    
    const rect = fullscreenContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setFullscreenSliderPosition(percentage);
  };

  const handleFullscreenMouseUp = () => {
    setIsFullscreenDragging(false);
  };

  const handleFullscreenTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsFullscreenDragging(true);
  };

  const handleFullscreenTouchMove = (e: React.TouchEvent) => {
    if (!isFullscreenDragging || !fullscreenContainerRef.current) return;
    
    const rect = fullscreenContainerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setFullscreenSliderPosition(percentage);
  };

  const handleFullscreenTouchEnd = () => {
    setIsFullscreenDragging(false);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div 
          ref={containerRef}
          className="relative aspect-square cursor-pointer group px-5 flex items-center justify-center select-none"
          onClick={handleImageClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative w-full aspect-square overflow-hidden rounded-[10px]">
            {/* 香蕉化后的图片（底层） */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={work.banana_image_url}
              alt="香蕉化作品"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
            
            {/* 原始图片（顶层，通过clip-path裁剪） */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={work.original_image_url}
                alt="原始图片"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {/* 滑动分割线 */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* 滑块手柄 */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <div className="flex gap-0.5">
                  <div className="w-0.5 h-4 bg-gray-400 rounded-full"></div>
                  <div className="w-0.5 h-4 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* 标签：原始 / 香蕉化 */}
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              原始
            </div>
            <div className="absolute top-2 right-2 bg-primary/80 text-white text-xs px-2 py-1 rounded">
              香蕉化
            </div>

            {/* 悬停遮罩 */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground mb-3">{work.analysis_report}</p>
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className="gap-2"
            >
              <Heart className={`w-4 h-4 ${likes > work.likes ? 'fill-primary text-primary' : ''}`} />
              <span>{likes}</span>
            </Button>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
              <ShareDialog
                imageUrl={work.banana_image_url}
                analysisReport={work.analysis_report}
                trigger={
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </Card>
      {/* 全屏图片预览 */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={handleCloseFullscreen}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={handleCloseFullscreen}
          >
            <X className="w-6 h-6" />
          </Button>
          
          {/* 对比图片容器 */}
          <div 
            ref={fullscreenContainerRef}
            className="relative max-w-full max-h-full select-none"
            onClick={(e) => e.stopPropagation()}
            onMouseMove={handleFullscreenMouseMove}
            onMouseUp={handleFullscreenMouseUp}
            onMouseLeave={handleFullscreenMouseUp}
            onTouchMove={handleFullscreenTouchMove}
            onTouchEnd={handleFullscreenTouchEnd}
          >
            <div className="relative">
              {/* 香蕉化后的图片（底层） */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={work.banana_image_url}
                alt="香蕉化作品"
                className="max-w-full max-h-[90vh] object-contain"
                draggable={false}
              />
              
              {/* 原始图片（顶层，通过clip-path裁剪） */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - fullscreenSliderPosition}% 0 0)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={work.original_image_url}
                  alt="原始图片"
                  className="max-w-full max-h-[90vh] object-contain"
                  draggable={false}
                />
              </div>

              {/* 滑动分割线 */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
                style={{ left: `${fullscreenSliderPosition}%` }}
              >
                {/* 滑块手柄 */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize"
                  onMouseDown={handleFullscreenMouseDown}
                  onTouchStart={handleFullscreenTouchStart}
                >
                  <div className="flex gap-1">
                    <div className="w-0.5 h-6 bg-gray-400 rounded-full"></div>
                    <div className="w-0.5 h-6 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* 标签：原始 / 香蕉化 */}
              <div className="absolute top-4 left-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded">
                原始
              </div>
              <div className="absolute top-4 right-4 bg-primary/80 text-white text-sm px-3 py-1.5 rounded">
                香蕉化
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
