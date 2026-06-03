'use client';

import { useEffect, useState } from 'react';
import { BananaWorkCard } from '../_components/banana/BananaWorkCard';
import { Button } from '../_components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../_components/ui/tabs';
import { Skeleton } from '../_components/ui/skeleton';
import { toast } from 'sonner';
import { TrendingUp, Clock } from 'lucide-react';
import type { BananaWork } from '@/lib/types/banana';
import { getAllBananaWorks, getPopularBananaWorks } from '@/lib/db/bananaApi';

export default function GalleryPage() {
  const [recentWorks, setRecentWorks] = useState<BananaWork[]>([]);
  const [popularWorks, setPopularWorks] = useState<BananaWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadRecentWorks = async (offset = 0) => {
    try {
      const works = await getAllBananaWorks(20, offset);
      if (offset === 0) setRecentWorks(works);
      else setRecentWorks((prev) => [...prev, ...works]);
      setHasMore(works.length === 20);
    } catch {
      toast.error('加载作品失败');
    }
  };

  const loadPopularWorks = async (offset = 0) => {
    try {
      const works = await getPopularBananaWorks(20, offset);
      if (offset === 0) setPopularWorks(works);
      else setPopularWorks((prev) => [...prev, ...works]);
      setHasMore(works.length === 20);
    } catch {
      toast.error('加载热门作品失败');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([loadRecentWorks(), loadPopularWorks()]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      if (activeTab === 'recent') await loadRecentWorks(recentWorks.length);
      else await loadPopularWorks(popularWorks.length);
    } finally {
      setLoadingMore(false);
    }
  };

  const currentWorks = activeTab === 'recent' ? recentWorks : popularWorks;

  const WorkGrid = ({ works }: { works: BananaWork[] }) => (
    loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-square w-full bg-muted" />
            <Skeleton className="h-4 w-3/4 bg-muted" />
            <Skeleton className="h-4 w-1/2 bg-muted" />
          </div>
        ))}
      </div>
    ) : works.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-muted-foreground">还没有作品，快去创建第一个吧！</p>
      </div>
    ) : (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {works.map((work) => (
            <BananaWorkCard key={work.id} work={work} onLikeUpdate={() => loadPopularWorks()} />
          ))}
        </div>
        {hasMore && (
          <div className="text-center mt-8">
            <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline" size="lg">
              {loadingMore ? '加载中...' : '加载更多'}
            </Button>
          </div>
        )}
      </>
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl xl:text-5xl font-bold mb-4 text-foreground">香蕉进化论</h1>
          <p className="text-lg text-muted-foreground">探索全球用户的香蕉化杰作</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="recent" className="gap-2">
              <Clock className="w-4 h-4" />
              最新作品
            </TabsTrigger>
            <TabsTrigger value="popular" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              热门作品
            </TabsTrigger>
          </TabsList>
          <TabsContent value="recent" className="mt-8">
            <WorkGrid works={currentWorks} />
          </TabsContent>
          <TabsContent value="popular" className="mt-8">
            <WorkGrid works={currentWorks} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
