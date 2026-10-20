import type { ComponentType } from "react";
import GuestLoginPanel from "@/components/auth/GuestLoginPanel";
import GuestComments from "@/components/comments/GuestComments";
import Guestbook from "@/components/guestbook/Guestbook";
import HomeIntro from "@/components/home/HomeIntro";
import NaverWeddingMap from "@/components/map/NaverWeddingMap";

type ComponentTest = {
  slug: string;
  name: string;
  description: string;
  component: ComponentType;
};

export const componentTests: ComponentTest[] = [
  {
    slug: "guestbook",
    name: "방명록",
    description: "축하 카드 선택, 소셜 로그인 후 작성, 방명록 목록을 확인합니다.",
    component: Guestbook,
  },
  {
    slug: "home-intro",
    name: "초대 문구",
    description: "청첩장의 첫 인사말을 확인합니다.",
    component: HomeIntro,
  },
  {
    slug: "wedding-map",
    name: "오시는 길",
    description: "예식장 지도와 길찾기 버튼을 확인합니다.",
    component: NaverWeddingMap,
  },
  {
    slug: "guest-login",
    name: "하객 로그인",
    description: "소셜 로그인과 익명 로그인 화면을 확인합니다.",
    component: GuestLoginPanel,
  },
  {
    slug: "guest-comments",
    name: "방명록 (기존)",
    description: "현재 방명록의 목록과 작성 폼을 확인합니다.",
    component: GuestComments,
  },
];
