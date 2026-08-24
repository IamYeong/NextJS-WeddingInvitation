"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { guestCommentsStrings } from "@/content/strings";
import styles from "./GuestComments.module.css";

const COMMENTS_PER_PAGE = 10;
const GUEST_LOGIN_CHANGED_EVENT = "guest-login-changed";

type Guest = {
  id: string;
  nickname: string;
};

type CommentItem = {
  id: string;
  authorId: string;
  authorNickname: string;
  content: string;
  createdAt: string;
};

async function fetchCurrentGuest() {
  const response = await fetch("/api/guest/me", {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as { guest: Guest | null };

  return body.guest;
}

async function fetchComments() {
  const response = await fetch("/api/comments", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(guestCommentsStrings.loadError);
  }

  return (await response.json()) as { comments: CommentItem[] };
}

export default function GuestComments() {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [comment, setComment] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"loading" | "idle" | "error">(
    "loading",
  );
  const [formStatus, setFormStatus] = useState<
    "idle" | "login-required" | "submitting" | "error"
  >("idle");

  const totalPages = Math.max(1, Math.ceil(comments.length / COMMENTS_PER_PAGE));
  const pageComments = useMemo(() => {
    const startIndex = (page - 1) * COMMENTS_PER_PAGE;

    return comments.slice(startIndex, startIndex + COMMENTS_PER_PAGE);
  }, [comments, page]);

  const refreshComments = async () => {
    setStatus("loading");

    try {
      const body = await fetchComments();

      setComments(body.comments);
      setPage(1);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    let isMounted = true;
    const handleGuestChanged = () => {
      void fetchCurrentGuest().then((nextGuest) => {
        if (isMounted) {
          setGuest(nextGuest);
          setFormStatus("idle");
        }
      });
    };

    void fetchCurrentGuest().then((nextGuest) => {
      if (isMounted) {
        setGuest(nextGuest);
      }
    });

    void fetchComments()
      .then((body) => {
        if (!isMounted) {
          return;
        }

        setComments(body.comments);
        setPage(1);
        setStatus("idle");
      })
      .catch(() => {
        if (isMounted) {
          setStatus("error");
        }
      });

    window.addEventListener(GUEST_LOGIN_CHANGED_EVENT, handleGuestChanged);

    return () => {
      isMounted = false;
      window.removeEventListener(GUEST_LOGIN_CHANGED_EVENT, handleGuestChanged);
    };
  }, []);

  const showLoginRequired = () => {
    if (!guest) {
      setFormStatus("login-required");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!guest) {
      setFormStatus("login-required");
      return;
    }

    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      return;
    }

    setFormStatus("submitting");

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: trimmedComment }),
      });

      if (!response.ok) {
        throw new Error(guestCommentsStrings.form.submitError);
      }

      setComment("");
      setFormStatus("idle");
      await refreshComments();
    } catch {
      setFormStatus("error");
    }
  };

  const goToPreviousPage = () => {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  };

  const goToNextPage = () => {
    setPage((currentPage) => Math.min(totalPages, currentPage + 1));
  };

  return (
    <section className={styles.section} aria-labelledby="guest-comments-title">
      <div className={styles.header}>
        <h2 id="guest-comments-title">{guestCommentsStrings.title}</h2>
        <span>{guestCommentsStrings.pageStatus(page, totalPages)}</span>
      </div>

      <div className={styles.list} aria-live="polite">
        {status === "loading" && (
          <p className={styles.message}>{guestCommentsStrings.loading}</p>
        )}
        {status === "error" && (
          <p className={styles.message}>{guestCommentsStrings.loadError}</p>
        )}
        {status === "idle" && comments.length === 0 && (
          <p className={styles.message}>{guestCommentsStrings.empty}</p>
        )}
        {status === "idle" &&
          pageComments.map((item) => (
            <article key={item.id} className={styles.comment}>
              <div className={styles.commentMeta}>
                <strong>{item.authorNickname}</strong>
                <time dateTime={item.createdAt}>
                  {new Intl.DateTimeFormat("ko-KR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(item.createdAt))}
                </time>
              </div>
              <p>{item.content}</p>
            </article>
          ))}
      </div>

      <div className={styles.pagination}>
        <button
          type="button"
          onClick={goToPreviousPage}
          disabled={page === 1}
          aria-label={guestCommentsStrings.pagination.previous}
        >
          {guestCommentsStrings.pagination.previousSymbol}
        </button>
        <span>{guestCommentsStrings.pageStatus(page, totalPages)}</span>
        <button
          type="button"
          onClick={goToNextPage}
          disabled={page === totalPages}
          aria-label={guestCommentsStrings.pagination.next}
        >
          {guestCommentsStrings.pagination.nextSymbol}
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.author}>
          <span>{guest?.nickname ?? guestCommentsStrings.form.authorFallback}</span>
        </label>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          onFocus={showLoginRequired}
          placeholder={guestCommentsStrings.form.placeholder}
          rows={3}
        />
        <button
          type="submit"
          disabled={formStatus === "submitting" || comment.trim().length === 0}
        >
          {formStatus === "submitting"
            ? guestCommentsStrings.form.submitting
            : guestCommentsStrings.form.submit}
        </button>
      </form>

      <p className={styles.formStatus} aria-live="polite">
        {formStatus === "login-required" &&
          guestCommentsStrings.form.loginRequired}
        {formStatus === "error" && guestCommentsStrings.form.submitError}
      </p>
    </section>
  );
}
