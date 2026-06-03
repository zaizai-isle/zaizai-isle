// 图片压缩工具

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_DIMENSION = 1080;
const INITIAL_QUALITY = 0.8;

export interface CompressionResult {
  file: File;
  compressed: boolean;
  originalSize: number;
  finalSize: number;
}

// 验证文件名是否只包含英文字母和数字
export function validateFileName(fileName: string): boolean {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  return /^[a-zA-Z0-9_-]+$/.test(nameWithoutExt);
}

// 生成安全的文件名
export function generateSafeFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `banana_${timestamp}_${random}.${ext}`;
}

// 压缩图片
export async function compressImage(file: File): Promise<CompressionResult> {
  const originalSize = file.size;

  // 如果文件已经小于1MB，直接返回
  if (originalSize <= MAX_FILE_SIZE) {
    return {
      file,
      compressed: false,
      originalSize,
      finalSize: originalSize,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // 计算新的尺寸
        let { width, height } = img;
        const maxDim = Math.max(width, height);

        if (maxDim > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / maxDim;
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        // 创建canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建canvas上下文'));
          return;
        }

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);

        // 尝试不同的质量级别进行压缩
        const tryCompress = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('图片压缩失败'));
                return;
              }

              // 如果压缩后仍然大于1MB，且质量还可以降低，继续压缩
              if (blob.size > MAX_FILE_SIZE && quality > 0.3) {
                tryCompress(quality - 0.1);
                return;
              }

              // 创建新文件
              const compressedFile = new File([blob], file.name, {
                type: 'image/webp',
                lastModified: Date.now(),
              });

              resolve({
                file: compressedFile,
                compressed: true,
                originalSize,
                finalSize: compressedFile.size,
              });
            },
            'image/webp',
            quality
          );
        };

        tryCompress(INITIAL_QUALITY);
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsDataURL(file);
  });
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
