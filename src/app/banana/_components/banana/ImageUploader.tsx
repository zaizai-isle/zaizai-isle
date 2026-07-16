'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { compressImage, validateFileName, generateSafeFileName, formatFileSize } from '@/lib/utils/imageCompression';
import type { CompressionResult } from '@/lib/utils/imageCompression';

interface ImageUploaderProps {
  onImageSelected: (file: File, preview: string) => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageSelected, disabled }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      setUploading(true);
      setProgress(10);

      try {
        if (!validateFileName(file.name)) {
          const safeName = generateSafeFileName(file.name);
          toast.info('文件名已自动调整', { description: `已重命名为：${safeName}` });
        }
        setProgress(30);
        const result: CompressionResult = await compressImage(file);
        setProgress(60);
        if (result.compressed) {
          toast.success('图片已自动压缩', {
            description: `原始：${formatFileSize(result.originalSize)}，压缩后：${formatFileSize(result.finalSize)}`,
          });
        }
        setProgress(80);
        const previewUrl = URL.createObjectURL(result.file);
        setPreview(previewUrl);
        setProgress(100);
        onImageSelected(result.file, previewUrl);
        toast.success('图片上传成功');
      } catch (error) {
        toast.error('图片处理失败', {
          description: error instanceof Error ? error.message : '未知错误',
        });
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [onImageSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'image/avif': ['.avif'],
    },
    maxFiles: 1,
    disabled: disabled || uploading,
  });

  return (
    <div className="w-full">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300
            ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary hover:bg-muted/50'}
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground mb-2">
                {isDragActive ? '放开以上传图片' : '上传你的宇宙，我们给你香蕉'}
              </p>
              <p className="text-sm text-muted-foreground">支持 JPG、PNG、WEBP、GIF、AVIF 格式</p>
              <p className="text-xs text-muted-foreground mt-1">图片将自动压缩至 1MB 以下</p>
            </div>
          </div>
          {uploading && (
            <div className="mt-6">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">处理中... {progress}%</p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <Image
            src={preview}
            alt="预览"
            width={1024}
            height={1024}
            unoptimized
            className="w-full h-auto"
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={() => setPreview('')}
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
