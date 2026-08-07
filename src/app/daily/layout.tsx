import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "小岛日签 | Zaizai Isle",
  description: "每天在 Zaizai Isle 留下一句话、一首诗，或一页安静的时间。",
};

export default function DailyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
