import type { Metadata } from "next";
import "./learning.css";
import "./owner-alert.css";
import { OwnerAlertModal } from "./OwnerAlertModal";

export const metadata: Metadata = { title: "每日一看 | Zaizai Isle", description: "每天用两分钟，从一件作品理解艺术史与设计史。" };
export default function LearningLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <>{children}<OwnerAlertModal /></>; }
