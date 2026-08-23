"use client";

import { useEffect, useRef, useState } from "react";
import { naverWeddingMapStrings } from "@/content/strings";
import styles from "./NaverWeddingMap.module.css";

const { venue } = naverWeddingMapStrings;

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
  const query = `dlat=${venue.lat}&dlng=${venue.lng}&dname=${encode(
    venue.name,
  )}&appname=${encode(naverWeddingMapStrings.appName)}`;

  return `nmap://navigation?${query}`;
}

function getNaverAndroidIntentUrl() {
  const query = `dlat=${venue.lat}&dlng=${venue.lng}&dname=${encode(
    venue.name,
  )}&appname=${encode(naverWeddingMapStrings.appName)}`;

  return `intent://navigation?${query}#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;end`;
}

function getKakaoRouteUrl() {
  return `https://map.kakao.com/link/to/${encode(venue.name)},${venue.lat},${venue.lng}`;
}

function getTmapRouteUrl() {
  const query = `goalname=${encode(venue.name)}&goalx=${venue.lng}&goaly=${venue.lat}`;

  return `tmap://route?${query}`;
}

function getTmapAndroidIntentUrl() {
  const query = `goalname=${encode(venue.name)}&goalx=${venue.lng}&goaly=${venue.lat}`;

  return `intent://route?${query}#Intent;scheme=tmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=${naverWeddingMapStrings.stores.tmapAndroidPackage};end`;
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
      window.location.href = naverWeddingMapStrings.stores.naverIos;
    }, 1200);
    return;
  }

  window.open(`https://map.naver.com/p/search/${encode(venue.name)}`, "_blank");
}

function openTmapNavigation() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = userAgent.includes("android");
  const isIos = /iphone|ipad|ipod/.test(userAgent);

  if (!isAndroid && !isIos) {
    window.alert(naverWeddingMapStrings.alerts.tmapMobileOnly);
    return;
  }

  const storeUrl = isAndroid
    ? naverWeddingMapStrings.stores.tmapAndroid
    : naverWeddingMapStrings.stores.tmapIos;
  const cleanupHandlers: Array<() => void> = [];

  const fallbackTimer = window.setTimeout(() => {
    cleanupHandlers.forEach((cleanup) => cleanup());

    if (
      document.visibilityState === "visible" &&
      window.confirm(naverWeddingMapStrings.alerts.tmapInstallConfirm)
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

      const venuePosition = new maps.LatLng(venue.lat, venue.lng);
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
        title: venue.name,
      });
      const infoWindow = new maps.InfoWindow({
        content: `<div class="${styles.infoWindow}"><strong>${venue.name}</strong><span>${venue.address}</span></div>`,
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

    const existingScript = document.getElementById(
      naverWeddingMapStrings.mapScriptId,
    );

    if (existingScript) {
      existingScript.addEventListener("load", initializeMap);
      existingScript.addEventListener("error", () => setMapStatus("error"));

      return () => {
        isMounted = false;
        existingScript.removeEventListener("load", initializeMap);
      };
    }

    const script = document.createElement("script");
    script.id = naverWeddingMapStrings.mapScriptId;
    script.async = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverWeddingMapStrings.naverMapKeyId}`;
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
        <p className={styles.eyebrow}>{naverWeddingMapStrings.labels.section}</p>
        <h2 id="wedding-map-title">{venue.name}</h2>
        <p>{venue.address}</p>
      </div>

      <div className={styles.frame}>
        <div ref={mapElementRef} className={styles.canvas} />
        {mapStatus !== "ready" && (
          <div className={styles.status} role="status">
            {mapStatus === "loading"
              ? naverWeddingMapStrings.status.loading
              : naverWeddingMapStrings.status.error}
          </div>
        )}
      </div>

      <div
        className={styles.actions}
        aria-label={naverWeddingMapStrings.labels.actions}
      >
        <button type="button" onClick={openNaverNavigation}>
          {naverWeddingMapStrings.buttons.naver}
        </button>
        <a href={getKakaoRouteUrl()} target="_blank" rel="noreferrer">
          {naverWeddingMapStrings.buttons.kakao}
        </a>
        <button type="button" onClick={openTmapNavigation}>
          {naverWeddingMapStrings.buttons.tmap}
        </button>
      </div>
    </section>
  );
}
