import type { Metadata } from "next";
import { LearningReview } from "./LearningReview";
import "../learning.css";
import "./review.css";

export const metadata: Metadata = { title: "内容审核 | 每日一看" };
export default function ReviewPage() { return <LearningReview />; }
