import type { ComponentType } from "react";
import GuestLoginPanel from "@/components/auth/GuestLoginPanel";
import GuestComments from "@/components/comments/GuestComments";
import HomeIntro from "@/components/home/HomeIntro";
import NaverWeddingMap from "@/components/map/NaverWeddingMap";
import PhotoPrinterDemo from "@/components/photo-printer/PhotoPrinterDemo";

type ComponentTest = {
  slug: string;
  name: string;
  description: string;
  component: ComponentType;
};

export const componentTests: ComponentTest[] = [
  {
    slug: "photo-printer",
    name: "네컷 사진 인화기",
    description: "사진 네 장을 교체하고 출구에서 인화되는 애니메이션을 확인합니다.",
    component: PhotoPrinterDemo,
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
