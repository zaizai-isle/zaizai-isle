import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/ma-shan-zheng/chinese-simplified.css";
import "@fontsource/ma-shan-zheng/latin.css";
import { hongLeiXingShuFont, xinYeNianFont, youRanXiaoKaiFont } from "../fonts";
import "./achievement.css";

export const metadata: Metadata = {
  title: "人生护照 | Zaizai Isle",
  description: "为一次真实的人生抵达盖下印章，并留下一张只属于你的纪念卡。",
};

export default function AchievementLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${xinYeNianFont.variable} ${youRanXiaoKaiFont.variable} ${hongLeiXingShuFont.variable} achievement-theme`}>
      {children}
    </div>
  );
}
