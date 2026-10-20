import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "컴포넌트 테스트",
  robots: { index: false, follow: false },
};

export default function ComponentTestLayout({ children }: { children: ReactNode }) {
  return children;
}
