'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Download } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { toast } from 'sonner';

interface ShareDialogProps {
  imageUrl: string;
  analysisReport?: string;
  trigger?: React.ReactNode;
}

export function ShareDialog({ imageUrl, analysisReport, trigger }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const canUseNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  // 生成分享文案
  const getShareText = () => {
    return `我用 Everything is Banana 创作了一个香蕉化作品！\n\n${analysisReport ? analysisReport.substring(0, 100) + '...' : ''}\n\n#NanoBananaPro #蕉你做人 #EverythingIsBanana`;
  };

  // 生成分享链接
  const getShareUrl = () => {
    return window.location.origin;
  };

  // 使用原生分享API
  const handleNativeShare = async () => {
    if (!canUseNativeShare) {
      toast.error('您的浏览器不支持原生分享功能');
      return;
    }

    try {
      await navigator.share({
        title: 'Everything is Banana - 我的香蕉化作品',
        text: getShareText(),
        url: getShareUrl(),
      });
      toast.success('分享成功');
      setOpen(false);
    } catch (error) {
      // 用户取消分享不显示错误
      if ((error as Error).name !== 'AbortError') {
        console.error('分享失败:', error);
      }
    }
  };

  // 复制链接
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      toast.success('链接已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败，请手动复制');
    }
  };

  // 复制分享文案
  const handleCopyText = async () => {
    try {
      const text = `${getShareText()}\n\n${getShareUrl()}`;
      await navigator.clipboard.writeText(text);
      toast.success('分享文案已复制到剪贴板');
      setOpen(false);
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败，请手动复制');
    }
  };

  // 下载图片
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `banana_work_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('图片下载成功');
  };

  // 分享到微博
  const handleShareToWeibo = () => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(getShareUrl());
    const pic = encodeURIComponent(imageUrl);
    window.open(
      `https://service.weibo.com/share/share.php?url=${url}&title=${text}&pic=${pic}`,
      '_blank',
      'width=600,height=400'
    );
  };

  // 分享到Twitter
  const handleShareToTwitter = () => {
    const text = encodeURIComponent('I created a bananaified artwork with Everything is Banana! #NanoBananaPro');
    const url = encodeURIComponent(getShareUrl());
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'width=600,height=400'
    );
  };

  // 分享到Facebook
  const handleShareToFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'width=600,height=400'
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            分享
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分享您的香蕉化作品</DialogTitle>
          <DialogDescription>选择您喜欢的分享方式</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 原生分享（移动端优先） */}
          {canUseNativeShare && (
            <Button onClick={handleNativeShare} className="w-full" size="lg">
              <Share2 className="w-5 h-5 mr-2" />
              使用系统分享
            </Button>
          )}

          {/* 快速操作 */}
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleCopyText} variant="outline" size="lg">
              <Copy className="w-4 h-4 mr-2" />
              复制文案
            </Button>
            <Button onClick={handleDownload} variant="outline" size="lg">
              <Download className="w-4 h-4 mr-2" />
              下载图片
            </Button>
          </div>

          {/* 复制链接 */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={getShareUrl()}
              readOnly
              className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
            />
            <Button onClick={handleCopyLink} variant="outline" size="icon">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {/* 社交媒体分享 */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">分享到社交媒体</p>
            <div className="grid grid-cols-3 gap-3">
              {/* 微博 */}
              <Button onClick={handleShareToWeibo} variant="outline" className="flex-col h-auto py-3">
                <div className="w-8 h-8 mb-1 rounded-full bg-[#E6162D] flex items-center justify-center text-white font-bold">
                  微
                </div>
                <span className="text-xs">微博</span>
              </Button>

              {/* Twitter */}
              <Button onClick={handleShareToTwitter} variant="outline" className="flex-col h-auto py-3">
                <div className="w-8 h-8 mb-1 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white font-bold">
                  𝕏
                </div>
                <span className="text-xs">Twitter</span>
              </Button>

              {/* Facebook */}
              <Button onClick={handleShareToFacebook} variant="outline" className="flex-col h-auto py-3">
                <div className="w-8 h-8 mb-1 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-bold">
                  f
                </div>
                <span className="text-xs">Facebook</span>
              </Button>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="text-xs text-muted-foreground text-center pt-2">
            💡 提示：下载图片后可以直接分享到微信、QQ等应用
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
