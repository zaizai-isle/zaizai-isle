'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageUploader } from './_components/banana/ImageUploader';
import { ShareDialog } from './_components/banana/ShareDialog';
import { Button } from './_components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './_components/ui/card';
import { Progress } from './_components/ui/progress';
import { toast } from 'sonner';
import { Sparkles, Download } from 'lucide-react';
import { uploadImage, createBananaWork } from '@/lib/db/bananaApi';
import {
  bananaifyImage,
  fileToBase64,
  submitImageUnderstanding,
  pollImageUnderstanding,
} from '@/lib/bananaApi';
import { generateBananaAnalysis } from '@/lib/chatApi';
import { generateSafeFileName } from '@/lib/utils/imageCompression';

export default function BananaHomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [bananaImageUrl, setBananaImageUrl] = useState<string>('');
  const [analysisReport, setAnalysisReport] = useState<string>('');

  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
    setBananaImageUrl('');
    setAnalysisReport('');
  };

  const handleBananaify = async () => {
    if (!selectedFile) {
      toast.error('请先上传图片');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setBananaImageUrl('');
    setAnalysisReport('');

    try {
      setProgressText('上传原始图片...');
      setProgress(10);
      const safeName = generateSafeFileName(selectedFile.name);
      const originalImageUrl = await uploadImage(selectedFile, `originals/${safeName}`);

      setProgressText('正在进行香蕉化处理（这可能需要1-2分钟）...');
      setProgress(20);
      const base64 = await fileToBase64(selectedFile);
      let mimeType = selectedFile.type;
      if (!mimeType || mimeType === '') mimeType = 'image/jpeg';

      const bananaBase64 = await bananaifyImage(base64, mimeType);
      setProgress(50);

      setProgressText('保存香蕉化图片...');
      const bananaBlob = await fetch(`data:image/png;base64,${bananaBase64}`).then((r) =>
        r.blob()
      );
      const bananaFile = new File([bananaBlob], `banana_${safeName}`, { type: 'image/png' });
      const resultUrl = await uploadImage(bananaFile, `bananas/banana_${safeName}`);
      setBananaImageUrl(resultUrl);
      setProgress(60);

      setProgressText('分析图片内容...');
      const taskId = await submitImageUnderstanding(
        originalImageUrl,
        '请详细描述这张图片的内容，包括主要物体、场景、颜色等信息。'
      );
      setProgress(70);

      setProgressText('等待分析结果...');
      const imageDescription = await pollImageUnderstanding(taskId);
      setProgress(80);

      setProgressText('生成香蕉学分析报告...');
      const analysis = await generateBananaAnalysis(imageDescription);
      setAnalysisReport(analysis);
      setProgress(90);

      setProgressText('保存作品...');
      await createBananaWork({
        original_image_url: originalImageUrl,
        banana_image_url: resultUrl,
        analysis_report: analysis,
      });

      setProgress(100);
      setProgressText('完成！');
      toast.success('香蕉化完成！', { description: '您的作品已保存到画廊' });
    } catch (error) {
      console.error('香蕉化失败:', error);
      toast.error('香蕉化失败', {
        description: error instanceof Error ? error.message : '未知错误',
      });
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressText('');
    }
  };

  const handleDownload = () => {
    if (!bananaImageUrl) return;
    const link = document.createElement('a');
    link.href = bananaImageUrl;
    link.download = `banana_work_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('下载成功');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl xl:text-6xl font-bold mb-4 text-foreground">
            Everything is Banana
          </h1>
          <p className="text-xl text-muted-foreground">您的世界，值得被「香蕉化」！</p>
        </div>

        <div className="grid xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* 左侧：上传区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                上传图片
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader onImageSelected={handleImageSelected} disabled={processing} />

              {selectedFile && !processing && !bananaImageUrl && (
                <Button onClick={handleBananaify} className="w-full mt-6" size="lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  开始香蕉化
                </Button>
              )}

              {processing && (
                <div className="mt-6">
                  <Progress value={progress} className="h-3 mb-2" />
                  <p className="text-sm text-center text-muted-foreground">{progressText}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 右侧：结果展示 */}
          <Card>
            <CardHeader>
              <CardTitle>香蕉化结果</CardTitle>
            </CardHeader>
            <CardContent>
              {!bananaImageUrl && !processing && (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p>上传图片并点击「开始香蕉化」查看结果</p>
                </div>
              )}

              {processing && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">正在处理中，请稍候...</p>
                  </div>
                </div>
              )}

              {bananaImageUrl && (
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden border border-border">
                    <Image
                      src={bananaImageUrl}
                      alt="香蕉化结果"
                      width={1024}
                      height={1024}
                      unoptimized
                      className="w-full h-auto"
                    />
                  </div>

                  {analysisReport && (
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-base">香蕉学分析报告</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {analysisReport}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleDownload} className="flex-1" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      下载
                    </Button>
                    <ShareDialog
                      imageUrl={bananaImageUrl}
                      analysisReport={analysisReport}
                      trigger={<Button className="flex-1">分享</Button>}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
