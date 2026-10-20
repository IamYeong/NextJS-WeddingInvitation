"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { guestbookCards } from "@/content/guestbook";
import styles from "./Guestbook.module.css";

type Guest = {
  nickname: string;
  provider: "anonymous" | "kakao" | "naver" | "google";
};

type Message = {
  id: string;
  authorNickname: string;
  content: string;
  createdAt: string;
};

const PAGE_SIZE = 5;
const DRAFT_KEY = "guestbook-draft";
const providers = [
  { id: "kakao", name: "카카오" },
  { id: "naver", name: "네이버" },
  { id: "google", name: "구글" },
] as const;

export default function Guestbook() {
  const router = useRouter();
  const [mode, setMode] = useState<"cover" | "write" | "select">("cover");
  const [leavingCover, setLeavingCover] = useState(false);
  const [returnPhase, setReturnPhase] = useState<"idle" | "gathering" | "lifting">("idle");
  const deckRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [guestStatus, setGuestStatus] = useState<"loading" | "ready" | "error">("loading");
  const [messages, setMessages] = useState<Message[]>([]);
  const [listStatus, setListStatus] = useState<"loading" | "ready" | "error">("loading");
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [flyingCard, setFlyingCard] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const pendingMessage = useRef<Message | null>(null);
  const busy = useRef(false);
  const authenticated = guest && guest.provider !== "anonymous";
  const totalPages = Math.max(1, Math.ceil(messages.length / PAGE_SIZE));

  async function loadMessages() {
    setListStatus("loading");
    try {
      const response = await fetch("/api/comments", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const body = await response.json();
      setMessages(body.comments);
      setListStatus("ready");
    } catch {
      setListStatus("error");
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    async function initialize() {
      const url = new URL(window.location.href);
      if (url.searchParams.has("login")) {
        setMode("write");
        try {
          setDraft(sessionStorage.getItem(DRAFT_KEY) ?? "");
        } catch {}
        if (url.searchParams.get("login") !== "success") {
          setNotice("로그인이 완료되지 않았어요. 다시 선택해주세요.");
        }
        url.searchParams.delete("login");
        window.history.replaceState(null, "", url);
      }
      await Promise.allSettled([
        fetch("/api/guest/me", { cache: "no-store", signal: controller.signal })
          .then(async (response) => {
            if (!response.ok) throw new Error();
            const body = await response.json();
            setGuest(body.guest);
            setGuestStatus("ready");
          })
          .catch(() => {
            if (!controller.signal.aborted) setGuestStatus("error");
          }),
        fetch("/api/comments", { cache: "no-store", signal: controller.signal })
          .then(async (response) => {
            if (!response.ok) throw new Error();
            const body = await response.json();
            setMessages(body.comments);
            setListStatus("ready");
          })
          .catch(() => {
            if (!controller.signal.aborted) setListStatus("error");
          }),
      ]);
    }
    void initialize();
    return () => controller.abort();
  }, []);

  function openCard(nextMode: "write" | "select") {
    if (returnPhase !== "idle") return;
    setNotice("");
    setLeavingCover(true);
    setMode(nextMode);
  }

  function login(provider: string) {
    if (!providers.some((item) => item.id === provider)) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, draft);
    } catch {}
    const returnTo = window.location.pathname;
    router.push(`/api/oauth/login/${provider}?returnTo=${encodeURIComponent(returnTo)}`);
  }

  async function submit(cardId?: string) {
    if (busy.current || returnPhase !== "idle" || leavingCover || (!cardId && (!authenticated || !draft.trim()))) return;
    busy.current = true;
    setSubmitting(true);
    setNotice("");
    try {
      const response = await fetch(cardId ? "/api/guestbook/cards" : "/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardId ? { cardId } : { content: draft.trim() }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          setGuest(null);
          setGuestStatus("ready");
          throw new Error("로그인이 만료되었어요. 다시 로그인해주세요.");
        }
        throw new Error("카드를 보내지 못했어요. 잠시 후 다시 시도해주세요.");
      }
      const body = await response.json();
      pendingMessage.current = body.comment;
      setFlyingCard(cardId ?? "write");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "카드를 보내지 못했어요.");
      busy.current = false;
      setSubmitting(false);
    }
  }

  function finishSending() {
    const message = pendingMessage.current;
    if (!message) return;
    pendingMessage.current = null;
    setMessages((current) => [message, ...current]);
    setListStatus("ready");
    setPage(1);
    setDraft("");
    try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
    if (mode === "write") setMode("cover");
    setFlyingCard(null);
    setSubmitting(false);
    busy.current = false;
    setNotice("축하의 마음이 전해졌어요. 감사합니다!");
  }

  function goBack() {
    if (busy.current || leavingCover || returnPhase !== "idle") return;
    setNotice("");
    if (mode === "select" && deckRef.current && carouselRef.current) {
      const deck = deckRef.current.getBoundingClientRect();
      for (const card of carouselRef.current.querySelectorAll<HTMLElement>("button")) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--gather-x", `${deck.left + deck.width / 2 - rect.left - rect.width / 2}px`);
        card.style.setProperty("--gather-y", `${deck.top - rect.top + 40}px`);
      }
      setReturnPhase("gathering");
    } else {
      setReturnPhase("lifting");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }

  return (
    <section className={styles.guestbook} aria-labelledby="guestbook-heading">
      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.mode}>{authenticated ? "회원 모드" : "비회원 모드"}</span>
          <h1 id="guestbook-heading">Guestbook</h1>
          <p>{listStatus === "loading" ? "축하의 마음을 모으고 있어요" : `축하 메시지 ${messages.length}개`}</p>
        </header>

        <div ref={deckRef} className={`${styles.deck} ${mode === "select" ? styles.expanded : ""} ${returnPhase !== "idle" ? styles.returning : ""}`}>
          <div className={styles.backCard} aria-hidden="true" />
          <div className={styles.middleCard} aria-hidden="true" />

            <div className={`${styles.cover} ${mode !== "cover" ? styles.coverBehind : ""} ${leavingCover ? styles.leaving : ""} ${returnPhase === "lifting" ? styles.comingForward : ""}`}
              aria-hidden={mode !== "cover" || undefined}
              inert={mode !== "cover"}
              onAnimationEnd={(event) => {
                if (event.target !== event.currentTarget) return;
                if (returnPhase === "lifting") {
                  setMode("cover");
                  setReturnPhase("idle");
                } else {
                  setLeavingCover(false);
                }
              }}>
              <span className={styles.overline}>WITH LOVE, ALWAYS</span>
              <div className={styles.coverCopy}>
                <h2>결혼을 축하하는<br />방명록을 작성해보세요.</h2>
                <p>축하의 한마디가 두 사람에게<br />소중한 추억이 돼요!</p>
              </div>
              <div className={styles.coverActions}>
                <button className={styles.primary} onClick={() => openCard("write")}>카드 작성하기</button>
                <button className={styles.secondary} onClick={() => openCard("select")}>카드 선택하기</button>
              </div>
            </div>

          {mode === "write" && (
            <form className={`${styles.writeCard} ${flyingCard === "write" ? styles.flying : ""}`}
              inert={returnPhase !== "idle"}
              onSubmit={handleSubmit} onAnimationEnd={() => { if (flyingCard === "write") finishSending(); }}>
              <div className={styles.cardHeader}>
                <h2>Your message</h2>
                <button type="button" onClick={goBack} disabled={submitting}>돌아가기</button>
              </div>
              {authenticated ? (
                <>
                  <label className={styles.messageField}>
                    <span className={styles.overline}>MESSAGE</span>
                    <textarea autoFocus value={draft} onChange={(event) => setDraft(event.target.value)}
                      placeholder="두 사람에게 전하고 싶은 마음을 적어주세요…" maxLength={1000} required disabled={submitting} />
                  </label>
                  <div className={styles.signature}>
                    <span>친애하는</span><strong>{guest.nickname}</strong>
                    <select aria-label="서명에 사용할 소셜 계정" value={guest.provider}
                      disabled={submitting} onChange={(event) => login(event.target.value)}>
                      {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
                    </select>
                  </div>
                  <button className={styles.primary} type="submit" disabled={submitting || !draft.trim()}>
                    {submitting ? "마음을 전하는 중…" : "축하의 마음 보내기"}
                  </button>
                </>
              ) : (
                <div className={styles.loginPrompt}>
                  <span className={styles.rule} />
                  <h3>마음에 이름을 담아주세요</h3>
                  <p>소셜 계정으로 이름을 확인하면<br />나만의 축하 메시지를 쓸 수 있어요.</p>
                  <div className={styles.loginActions} aria-label="소셜 로그인">
                    {providers.map((provider) => (
                      <button type="button" key={provider.id} className={styles[provider.id]}
                        disabled={guestStatus === "loading"} onClick={() => login(provider.id)}>
                        {provider.name}로 계속하기
                      </button>
                    ))}
                  </div>
                  {guestStatus === "error" && <p>로그인 정보를 확인하지 못했어요. 다시 로그인해주세요.</p>}
                  <button type="button" className={styles.textButton} onClick={() => setMode("select")}>
                    로그인 없이 카드를 고를래요 →
                  </button>
                </div>
              )}
            </form>
          )}

          {mode === "select" && (
            <div className={styles.selection} inert={returnPhase !== "idle"}
              onAnimationEnd={(event) => {
                if (returnPhase === "gathering" && event.target === carouselRef.current?.firstElementChild) {
                  setReturnPhase("lifting");
                }
              }}>
              <div className={styles.selectionHeader}>
                <p>마음에 드는 카드를 골라주세요</p>
                <button type="button" onClick={goBack} disabled={submitting}>돌아가기</button>
              </div>
              <div ref={carouselRef} className={styles.carousel} tabIndex={0} aria-label="축하 카드 선택, 좌우로 스크롤하세요">
                {guestbookCards.map((card, index) => (
                  <button type="button" key={card.id}
                    className={`${styles.choiceCard} ${styles[`tilt${index}`]} ${flyingCard === card.id ? styles.flying : ""}`}
                    disabled={submitting} onClick={() => void submit(card.id)}
                    onAnimationEnd={() => { if (flyingCard === card.id) finishSending(); }}>
                    <span className={styles.overline}>{card.caption}</span>
                    <span className={styles.rule} />
                    <strong>{card.title}</strong>
                    <span className={styles.choiceMessage}>{card.message}</span>
                    <span className={styles.choiceFooter}>{submitting && !flyingCard ? "마음을 전하는 중…" : "이 마음 전하기 ↓"}</span>
                  </button>
                ))}
                <div className={styles.coverAtBack} aria-hidden="true">With love<br /><span>Guestbook</span></div>
              </div>
              <p className={styles.anonymousHint}>로그인 없이, 임의의 닉네임으로 전해져요.</p>
            </div>
          )}
        </div>

        <p className={styles.swipeHint}>
          <Image src="/guestbook/swipe.svg" width={15} height={14} alt="" />
          {mode === "select" ? "옆으로 스와이프하고 마음에 드는 카드를 눌러주세요" : "당신의 축하가 소중한 추억이 됩니다"}
        </p>
        <p className={styles.notice} role="status">{notice}</p>

        <div className={styles.messages} aria-label="방명록 목록" aria-busy={listStatus === "loading"}>
          <p className={styles.overline}>{messages.length} MESSAGES</p>
          {listStatus === "loading" && <p className={styles.empty}>축하 메시지를 불러오는 중이에요…</p>}
          {listStatus === "error" && (
            <div className={styles.empty}><p>아직 메시지를 불러오지 못했어요.</p>
              <button type="button" className={styles.textButton} onClick={() => void loadMessages()}>다시 불러오기</button>
            </div>
          )}
          {listStatus === "ready" && messages.length === 0 && <p className={styles.empty}>첫 번째 축하의 마음을 남겨주세요.</p>}
          {listStatus === "ready" && messages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((message) => (
            <article key={message.id} className={styles.messageCard}>
              <p>{message.content}</p>
              <div className={styles.messageSignature}><span />{message.authorNickname}</div>
            </article>
          ))}
          {messages.length > 0 && (
            <nav className={styles.pagination} aria-label="방명록 페이지">
              <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} aria-label="이전 페이지">←</button>
              <span aria-live="polite">{page} / {totalPages}</span>
              <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} aria-label="다음 페이지">→</button>
            </nav>
          )}
        </div>
        <footer className={styles.footer}>WITH LOVE</footer>
      </div>
    </section>
  );
}
