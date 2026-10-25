import type { Metadata } from "next";
import WeddingHome from "@/components/wedding-home/WeddingHome";
import { wedding } from "@/content/wedding";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${wedding.names}의 결혼식에 초대합니다`,
  description: `${wedding.date}, ${wedding.venue}. 우리의 새로운 시작에 함께해 주세요.`,
};

export default function Home() {
  return <main className={styles.page}><WeddingHome /></main>;
}
