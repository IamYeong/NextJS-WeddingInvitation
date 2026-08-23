"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { guestLoginPanelStrings } from "@/content/strings";
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
    throw new Error(guestLoginPanelStrings.errors.fetchCurrentGuest);
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
        throw new Error(guestLoginPanelStrings.errors.anonymousLogin);
      }

      const { guest } = (await response.json()) as { guest: Guest };

      setGuest(guest);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  const startOAuthLogin = (provider: "kakao" | "naver" | "google") => {
    router.push(`/api/oauth/login/${provider}`);
  };

  return (
    <section className={styles.section} aria-labelledby="guest-login-title">
      <h2 id="guest-login-title">{guestLoginPanelStrings.title}</h2>

      <div className={styles.actions}>
        <button type="button" onClick={() => startOAuthLogin("kakao")}>
          {guestLoginPanelStrings.buttons.kakao}
        </button>
        <button type="button" onClick={() => startOAuthLogin("naver")}>
          {guestLoginPanelStrings.buttons.naver}
        </button>
        <button type="button" onClick={() => startOAuthLogin("google")}>
          {guestLoginPanelStrings.buttons.google}
        </button>
        <button type="button" onClick={handleAnonymousLogin}>
          {guestLoginPanelStrings.buttons.anonymous}
        </button>
      </div>

      <p className={styles.status} aria-live="polite">
        {status === "loading" && guestLoginPanelStrings.status.loading}
        {status === "error" && guestLoginPanelStrings.status.error}
        {status === "idle" &&
          (guest
            ? guestLoginPanelStrings.status.loggedIn(guest.nickname)
            : guestLoginPanelStrings.status.idle)}
      </p>
    </section>
  );
}
