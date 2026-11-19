"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** /learning/<id>/ 兼容入口的最小交互叶：把旧深链替换到统一的 /learning?entry=… 阅读入口。
 *  本页永不渲染正文——下架或未到午夜的内容在入口端只会看到诚实的空态。 */
export default function LearningEntryRedirect({ entry }: { entry: string }) {
  const router = useRouter();
  const href = `/learning?entry=${encodeURIComponent(entry)}`;
  useEffect(() => {
    router.replace(href);
  }, [router, href]);
  return (
    <p className="learning-compat-hint">
      正在打开这篇每日一看……{" "}
      <Link href={`/learning?entry=${encodeURIComponent(entry)}`}>若没有自动跳转，点这里阅读。</Link>
    </p>
  );
}
