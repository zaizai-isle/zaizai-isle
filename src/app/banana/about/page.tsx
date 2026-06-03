import { Card, CardContent, CardHeader, CardTitle } from '../_components/ui/card';
import { Sparkles, Zap, Target, Layers } from 'lucide-react';

export const metadata = { title: '关于我们 - Everything is Banana' };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl xl:text-5xl font-bold mb-4 text-foreground">关于我们</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            探索「香蕉化」技术的奥秘
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                香蕉化技术原理
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Everything is Banana 采用了最先进的「量子香蕉态叠加理论」，结合深度学习神经网络和香蕉基因组学，实现了对任意物体的精确香蕉化转换。
              </p>
              <p>
                我们的AI模型经过数百万张香蕉图片的训练，能够识别物体的「香蕉化潜力指数」（Banana Potential Index，简称BPI），并根据物体的形态、纹理、光照等特征，生成最符合其本质的香蕉形态。
              </p>
              <p>
                该技术的核心在于「碳水化合物弯曲率算法」（Carbohydrate Curvature Algorithm），它能够精确计算出物体转换为香蕉后的最佳弯曲角度，确保每个香蕉都保持完美的弧度。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                开发理念
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                在这个充满严肃和压力的世界里，我们相信幽默和创意的力量。Everything is Banana 的诞生，源于一个简单的想法：如果世界上的一切都变成香蕉，会是什么样子？
              </p>
              <p>
                我们希望通过这个项目，为用户带来欢乐和惊喜，同时展示AI技术在创意领域的无限可能。每一次香蕉化，都是一次对现实的荒诞解构，也是一次对想象力的自由释放。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                香蕉化转换规则
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                我们的AI系统遵循严格的「香蕉化转换协议」，针对不同类型的物体采用专门的转换策略。
              </p>
              <div className="space-y-5">
                {[
                  {
                    icon: '🪑',
                    title: '家具类物体',
                    desc: '使用干燥、固化或石化的香蕉纤维，或堆叠的香蕉束构建，保持原有结构强度和功能性。',
                  },
                  {
                    icon: '📱',
                    title: '家电类物体',
                    desc: '外壳由光洁的香蕉皮覆盖，屏幕替换为高光泽的香蕉切片，按键替换为香蕉蒂或香蕉尖端。',
                  },
                  {
                    icon: '✏️',
                    title: '生活用品类物体',
                    desc: '完全替换为相应的香蕉微缩模型，保持原物体的基本形态和比例，每个细节都经过精心设计。',
                  },
                ].map((item) => (
                  <div key={item.title} className="border-l-4 border-primary/50 pl-4 py-2">
                    <h3 className="font-semibold text-foreground mb-1">{item.icon} {item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                核心特性
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                {[
                  ['智能物体识别', 'AI能够精确识别图片中的所有物体，无论是人物、建筑还是自然景观'],
                  ['逼真形态转换', '保持原有构图和透视关系，将每个物体转换为相应形态的香蕉'],
                  ['光照渲染', '根据原图光照和环境进行渲染，呈现逼真的香蕉皮质感'],
                  ['香蕉学分析', 'AI自动生成幽默的伪科学分析报告，为每个作品增添趣味'],
                  ['社区画廊', '展示全球用户的创意作品，分享香蕉化的乐趣'],
                ].map(([title, desc]) => (
                  <li key={title} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">{title}：</strong>{desc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-center text-lg text-foreground font-medium">
                「在香蕉的世界里，一切皆有可能。」
              </p>
              <p className="text-center text-sm text-muted-foreground mt-2">
                —— Everything is Banana 研究院
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
