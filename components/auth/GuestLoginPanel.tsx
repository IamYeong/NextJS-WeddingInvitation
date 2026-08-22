"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./GuestLoginPanel.module.css";

type Guest = {
  id: string;
  nickname: string;
  provider: "kakao" | "google" | "naver" | "anonymous";
  oauthUserId?: string;
};

async function fetchCurrentGuest() {
  const response = await fetch("/api/guest/me", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("로그인 정보를 확인하지 못했습니다.");
  }

  return (await response.json()) as { guest: Guest | null };
}

export default function GuestLoginPanel() {
  const router = useRouter();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">(
    "loading",
  );

  useEffect(() => {
    fetchCurrentGuest()
      .then(({ guest }) => {
        setGuest(guest);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, []);

  const handleAnonymousLogin = async () => {
    setStatus("loading");

    try {
      const response = await fetch("/api/guest/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider: "anonymous" }),
      });

      if (!response.ok) {
        throw new Error("비회원 로그인에 실패했습니다.");
      }

      const { guest } = (await response.json()) as { guest: Guest };

      setGuest(guest);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  const startOAuthLogin = (provider: "kakao" | "naver" | "google") => {
    router.push(`/api/oauth/start/${provider}`);
  };

  return (
    <section className={styles.section} aria-labelledby="guest-login-title">
      <h2 id="guest-login-title">방명록 로그인</h2>

      <div className={styles.actions}>
        <button type="button" onClick={() => startOAuthLogin("kakao")}>
          카카오 로그인
        </button>
        <button type="button" onClick={() => startOAuthLogin("naver")}>
          네이버 로그인
        </button>
        <button type="button" onClick={() => startOAuthLogin("google")}>
          구글 로그인
        </button>
        <button type="button" onClick={handleAnonymousLogin}>
          비회원 로그인
        </button>
      </div>

      <p className={styles.status} aria-live="polite">
        {status === "loading" && "로그인 정보를 확인하는 중입니다."}
        {status === "error" && "로그인 정보를 확인하지 못했습니다."}
        {status === "idle" &&
          (guest
            ? `${guest.nickname} 님으로 로그인되었습니다.`
            : "아직 로그인하지 않았습니다.")}
      </p>
    </section>
  );
}
