import type { Metadata } from "next";
import WeddingHome from "@/components/wedding-home/WeddingHome";
import { wedding } from "@/content/wedding";
import { getWeddingCouple } from "@/server/wedding/getWeddingCouple";
import { formatCoupleNames } from "@/content/couple";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const couple = await getWeddingCouple();
  return {
    title: `${formatCoupleNames(couple, "fullName")}의 결혼식에 초대합니다`,
    description: `${wedding.date}, ${wedding.venue}. 우리의 새로운 시작에 함께해 주세요.`,
  };
}

export default async function Home() {
  const couple = await getWeddingCouple();
  return <main className={styles.page}><WeddingHome couple={couple} /></main>;
}
