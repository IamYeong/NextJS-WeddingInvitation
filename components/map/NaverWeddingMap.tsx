"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./NaverWeddingMap.module.css";

const NAVER_MAP_SCRIPT_ID = "naver-map-script";
const NAVER_MAP_KEY_ID = "4imwgi7lfb";
const VENUE_NAME = "송파문정 더 컨벤션";
const VENUE_ADDRESS = "서울 송파구 송파대로 155";
const VENUE_LAT = 37.484140411747;
const VENUE_LNG = 127.1228704328;
const APP_NAME = "wedding-invitation";
const TMAP_ANDROID_PACKAGE = "com.skt.tmap.ku";
const TMAP_ANDROID_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.skt.tmap.ku";
const TMAP_IOS_STORE_URL = "https://apps.apple.com/kr/app/id431589174";

type NaverMapApi = {
  LatLng: new (lat: number, lng: number) => object;
  Map: new (
    element: HTMLElement,
    options: Record<string, unknown>,
  ) => object;
  Marker: new (options: Record<string, unknown>) => object;
  InfoWindow: new (options: Record<string, unknown>) => {
    open: (map: object, marker: object) => void;
  };
  Position?: {
    TOP_RIGHT?: string;
  };
  Event?: {
    addListener: (
      target: object,
      eventName: string,
      listener: () => void,
    ) => void;
  };
};

declare global {
  interface Window {
    naver?: {
      maps?: NaverMapApi;
    };
  }
}

function encode(value: string) {
  return encodeURIComponent(value);
}

function getNaverNavigationUrl() {
  const query = `dlat=${VENUE_LAT}&dlng=${VENUE_LNG}&dname=${encode(
    VENUE_NAME,
  )}&appname=${encode(APP_NAME)}`;

  return `nmap://navigation?${query}`;
}

function getNaverAndroidIntentUrl() {
  const query = `dlat=${VENUE_LAT}&dlng=${VENUE_LNG}&dname=${encode(
    VENUE_NAME,
  )}&appname=${encode(APP_NAME)}`;

  return `intent://navigation?${query}#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;end`;
}

function getKakaoRouteUrl() {
  return `https://map.kakao.com/link/to/${encode(VENUE_NAME)},${VENUE_LAT},${VENUE_LNG}`;
}

function getTmapRouteUrl() {
  const query = `goalname=${encode(VENUE_NAME)}&goalx=${VENUE_LNG}&goaly=${VENUE_LAT}`;

  return `tmap://route?${query}`;
}

function getTmapAndroidIntentUrl() {
  const query = `goalname=${encode(VENUE_NAME)}&goalx=${VENUE_LNG}&goaly=${VENUE_LAT}`;

  return `intent://route?${query}#Intent;scheme=tmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=${TMAP_ANDROID_PACKAGE};end`;
}

function openNaverNavigation() {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("android")) {
    window.location.href = getNaverAndroidIntentUrl();
    return;
  }

  if (/iphone|ipad|ipod/.test(userAgent)) {
    window.location.href = getNaverNavigationUrl();
    window.setTimeout(() => {
      window.location.href = "https://apps.apple.com/kr/app/id311867728";
    }, 1200);
    return;
  }

  window.open(`https://map.naver.com/p/search/${encode(VENUE_NAME)}`, "_blank");
}

function openTmapNavigation() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = userAgent.includes("android");
  const isIos = /iphone|ipad|ipod/.test(userAgent);

  if (!isAndroid && !isIos) {
    window.alert("티맵 길안내는 Android/iOS 티맵 앱에서만 사용할 수 있습니다.");
    return;
  }

  const storeUrl = isAndroid ? TMAP_ANDROID_STORE_URL : TMAP_IOS_STORE_URL;
  const cleanupHandlers: Array<() => void> = [];

  const fallbackTimer = window.setTimeout(() => {
    cleanupHandlers.forEach((cleanup) => cleanup());

    if (
      document.visibilityState === "visible" &&
      window.confirm("티맵 앱이 설치되어 있지 않다면 앱 설치 페이지로 이동할까요?")
    ) {
      window.location.href = storeUrl;
    }
  }, 1400);

  const cancelFallback = () => {
    window.clearTimeout(fallbackTimer);
    cleanupHandlers.forEach((cleanup) => cleanup());
  };
  const cancelOnHidden = () => {
    if (document.visibilityState === "hidden") {
      cancelFallback();
    }
  };

  window.addEventListener("pagehide", cancelFallback, { once: true });
  document.addEventListener("visibilitychange", cancelOnHidden);
  cleanupHandlers.push(
    () => window.removeEventListener("pagehide", cancelFallback),
    () => document.removeEventListener("visibilitychange", cancelOnHidden),
  );

  window.location.href = isAndroid
    ? getTmapAndroidIntentUrl()
    : getTmapRouteUrl();
}

export default function NaverWeddingMap() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let isMounted = true;

    const initializeMap = () => {
      if (!isMounted || initializedRef.current || !mapElementRef.current) {
        return;
      }

      const maps = window.naver?.maps;

      if (!maps) {
        setMapStatus("error");
        return;
      }

      const venuePosition = new maps.LatLng(VENUE_LAT, VENUE_LNG);
      const map = new maps.Map(mapElementRef.current, {
        center: venuePosition,
        zoom: 17,
        minZoom: 11,
        zoomControl: true,
        zoomControlOptions: {
          position: maps.Position?.TOP_RIGHT,
        },
      });
      const marker = new maps.Marker({
        map,
        position: venuePosition,
        title: VENUE_NAME,
      });
      const infoWindow = new maps.InfoWindow({
        content: `<div class="${styles.infoWindow}"><strong>${VENUE_NAME}</strong><span>${VENUE_ADDRESS}</span></div>`,
      });

      infoWindow.open(map, marker);
      maps.Event?.addListener(marker, "click", () =>
        infoWindow.open(map, marker),
      );

      initializedRef.current = true;
      setMapStatus("ready");
    };

    if (window.naver?.maps) {
      initializeMap();
      return () => {
        isMounted = false;
      };
    }

    const existingScript = document.getElementById(NAVER_MAP_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", initializeMap);
      existingScript.addEventListener("error", () => setMapStatus("error"));

      return () => {
        isMounted = false;
        existingScript.removeEventListener("load", initializeMap);
      };
    }

    const script = document.createElement("script");
    script.id = NAVER_MAP_SCRIPT_ID;
    script.async = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_KEY_ID}`;
    script.addEventListener("load", initializeMap);
    script.addEventListener("error", () => setMapStatus("error"));
    document.head.appendChild(script);

    return () => {
      isMounted = false;
      script.removeEventListener("load", initializeMap);
    };
  }, []);

  return (
    <section className={styles.section} aria-labelledby="wedding-map-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>오시는 길</p>
        <h2 id="wedding-map-title">{VENUE_NAME}</h2>
        <p>{VENUE_ADDRESS}</p>
      </div>

      <div className={styles.frame}>
        <div ref={mapElementRef} className={styles.canvas} />
        {mapStatus !== "ready" && (
          <div className={styles.status} role="status">
            {mapStatus === "loading"
              ? "지도를 불러오는 중입니다."
              : "지도 로드에 실패했습니다. 허용 도메인과 ncpKeyId 설정을 확인해주세요."}
          </div>
        )}
      </div>

      <div className={styles.actions} aria-label="지도 앱 길안내">
        <button type="button" onClick={openNaverNavigation}>
          네이버지도 내비게이션
        </button>
        <a href={getKakaoRouteUrl()} target="_blank" rel="noreferrer">
          카카오맵 길찾기
        </a>
        <button type="button" onClick={openTmapNavigation}>
          티맵으로 가기
        </button>
      </div>
    </section>
  );
}
