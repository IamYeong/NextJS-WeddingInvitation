"use client";

import { useEffect, useId, useState } from "react";
import type { FamilyAccount, FamilyRole } from "@/server/domain/entity/FamilyAccount";
import styles from "./FamilyAccounts.module.css";

const groups: { title: string; roles: FamilyRole[] }[] = [
  { title: "신랑측 계좌번호", roles: ["groom", "groomFather", "groomMother"] },
  { title: "신부측 계좌번호", roles: ["bride", "brideFather", "brideMother"] },
];
const labels: Record<FamilyRole, string> = {
  groom: "신랑", bride: "신부", groomFather: "아버지", groomMother: "어머니",
  brideFather: "아버지", brideMother: "어머니",
};

export default function FamilyAccounts() {
  const id = useId();
  const [accounts, setAccounts] = useState<FamilyAccount[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/family-accounts", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error();
        const body = await response.json() as { accounts: FamilyAccount[] };
        if (!controller.signal.aborted) {
          setAccounts(body.accounts);
          setStatus("ready");
        }
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);

  async function copy(account: FamilyAccount) {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setNotice(`${account.name} 님의 계좌번호를 복사했어요.`);
    } catch {
      setNotice("복사하지 못했어요. 계좌번호를 길게 눌러 직접 복사해주세요.");
    }
  }

  return (
    <section className={styles.section} aria-labelledby={`${id}-heading`}>
      <div className={styles.content}>
        <span className={styles.eyebrow}>WITH GRATITUDE</span>
        <span className={styles.ornament} aria-hidden="true">✳</span>
        <h2 id={`${id}-heading`}>마음 전하실 곳</h2>
        <p className={styles.intro}>저희의 새로운 시작을 축복해 주시는<br />따뜻한 마음에 깊이 감사드립니다.</p>
        <div className={styles.accounts} aria-busy={status === "loading"}>
          {status === "loading" && <p className={styles.message} role="status">마음을 전하실 곳을 불러오고 있어요.</p>}
          {status === "error" && <div className={styles.message}><p>계좌 정보를 불러오지 못했어요.</p><button type="button" className={styles.retry} onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }}>다시 불러오기</button></div>}
          {status === "ready" && accounts.length === 0 && <p className={styles.message}>계좌 정보를 준비하고 있어요.</p>}
          {status === "ready" && groups.map((group) => {
            const members = group.roles.flatMap((role) => accounts.filter((account) => account.role === role));
            if (!members.length) return null;
            return (
              <details className={styles.group} key={group.title}>
                <summary>{group.title}<span className={styles.chevron} aria-hidden="true" /></summary>
                <div className={styles.members}>
                  {members.map((account) => (
                    <article className={styles.member} key={account.role}>
                      <div className={styles.identity}><span>{labels[account.role]}</span><strong>{account.name}</strong></div>
                      <div className={styles.account}><p>{account.accountNumber || "계좌 정보를 준비하고 있어요."}</p>
                        {account.accountNumber && <button type="button" onClick={() => void copy(account)} aria-label={`${labels[account.role]} ${account.name} 계좌번호 복사`}>복사</button>}
                      </div>
                    </article>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
        <p className={styles.notice} role="status" aria-live="polite">{notice}</p>
        <p className={styles.footer}>보내주신 마음, 소중히 간직하겠습니다.</p>
      </div>
    </section>
  );
}
