"use client";

import { useState } from "react";
import Link from "next/link";
import WeddingEnvelope, { defaultWeddingOverview, type WeddingOverview } from "./WeddingEnvelope";
import styles from "./EnvelopeDemo.module.css";

const fields: { key: keyof WeddingOverview; label: string; maxLength: number }[] = [
  { key: "heading", label: "상단 문구", maxLength: 50 },
  { key: "names", label: "두 사람 이름", maxLength: 30 },
  { key: "date", label: "예식 일시", maxLength: 70 },
  { key: "venue", label: "예식 장소", maxLength: 100 },
  { key: "message", label: "초대 문구", maxLength: 120 },
];

export default function EnvelopeDemo() {
  const [overview, setOverview] = useState(defaultWeddingOverview);
  return <main className={styles.page}>
    <header className={styles.header}>
      <Link href="/test">← 컴포넌트 목록</Link>
      <p>A LETTER FOR YOU</p>
      <h1>소중한 당신을 초대합니다</h1>
      <span>봉투를 열어, 우리의 시작을 만나보세요.</span>
    </header>
    <div className={styles.layout}>
      <WeddingEnvelope overview={overview} />
      <form className={styles.editor} onSubmit={(event) => event.preventDefault()}>
        <span className={styles.kicker}>YOUR INVITATION</span>
        <h2>초대장에 담을 이야기</h2>
        <p>문구를 바꾸면 초대장에 바로 반영됩니다.</p>
        {fields.map(({ key, label, maxLength }) => <label key={key} htmlFor={`envelope-${key}`}>{label}<input id={`envelope-${key}`} value={overview[key]} maxLength={maxLength} onChange={(event) => setOverview((previous) => ({ ...previous, [key]: event.target.value }))} /></label>)}
        <button type="button" onClick={() => setOverview(defaultWeddingOverview)}>예시 문구로 되돌리기</button>
        <small>테스트용 예시 정보입니다. 수정 내용은 이 화면에서만 유지됩니다.</small>
      </form>
    </div>
  </main>;
}
