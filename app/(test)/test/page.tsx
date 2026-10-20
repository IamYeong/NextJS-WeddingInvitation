import Link from "next/link";
import { componentTests } from "@/components/component-tests/registry";
import styles from "./page.module.css";

export default function ComponentTestListPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>컴포넌트 테스트</h1>
        <p>컴포넌트를 선택하면 독립된 화면에서 확인할 수 있습니다.</p>
      </header>
      <ul className={styles.list}>
        {componentTests.map((test) => (
          <li key={test.slug}>
            <Link href={`/test/${test.slug}`} className={styles.item}>
              <h2>{test.name}</h2>
              <p>{test.description}</p>
              <span>/test/{test.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
