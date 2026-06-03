import { Card, CardContent, CardHeader, CardTitle } from '../_components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../_components/ui/accordion';
import { HelpCircle } from 'lucide-react';

export const metadata = { title: 'FAQ - Everything is Banana' };

const faqs = [
  { q: '什么是「香蕉化」？', a: '「香蕉化」是一种AI图像处理技术，它能够将图片中的所有物体智能地转换为香蕉形态，同时保持原有的构图、透视和光照效果。' },
  { q: '支持哪些图片格式？', a: '支持 JPG、JPEG、PNG、WEBP、GIF 和 AVIF。上传的图片会自动压缩至 1MB 以下，以确保最佳的处理速度。' },
  { q: '香蕉化处理需要多长时间？', a: '处理时间通常在 30 秒到 2 分钟之间，取决于图片的复杂度和服务器负载。' },
  { q: '为什么我的图片会被自动压缩？', a: '为确保最佳的处理速度，我们会自动将超过 1MB 的图片压缩。压缩过程会保持图片质量，并转换为 WEBP 格式。' },
  { q: '什么是「香蕉学分析报告」？', a: '「香蕉学分析报告」是AI生成的幽默伪科学分析文案，它会用虚构的科学术语（如「碳水化合物弯曲率」、「可剥性指数」等）对图片进行荒诞但听起来专业的分析。' },
  { q: '我可以下载香蕉化后的图片吗？', a: '当然！每个香蕉化作品都提供下载功能，您可以将作品保存到本地，或分享到社交媒体。' },
  { q: '我的作品会被公开展示吗？', a: '是的，所有香蕉化作品都会自动保存到「香蕉进化论」画廊中，供所有用户浏览和欣赏。' },
  { q: '如何给作品点赞？', a: '在画廊页面，每个作品卡片下方都有点赞按钮。点击心形图标即可为喜欢的作品点赞。' },
  { q: '香蕉化的效果为什么有时候不太理想？', a: 'AI的表现受到多种因素影响，包括原图的清晰度、物体的复杂度等。建议使用清晰、光照良好、物体明确的图片以获得最佳效果。' },
  { q: '这个项目是免费的吗？', a: '是的，Everything is Banana 目前完全免费。' },
  { q: '为什么选择香蕉？', a: '香蕉独特的弯曲形状、鲜艳颜色和简单结构使其成为理想的转换目标。将一切都变成香蕉这个想法本身就充满了荒诞和幽默感。' },
  { q: '我可以商用香蕉化后的图片吗？', a: '您创建的香蕉化作品归您所有，但请注意原始图片的版权。如果原始图片不是您自己拍摄或创作的，请确保您有权使用该图片。' },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl xl:text-5xl font-bold mb-4 text-foreground">常见问题</h1>
          <p className="text-lg text-muted-foreground">关于香蕉化的一切疑问</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                FAQ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-center text-foreground">还有其他问题？欢迎通过社交媒体联系我们！</p>
              <p className="text-center text-sm text-muted-foreground mt-2">
                使用话题标签 <span className="font-medium">#NanoBananaPro</span> 或{' '}
                <span className="font-medium">#蕉你做人</span> 与我们互动
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
