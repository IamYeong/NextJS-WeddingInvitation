# ScrollNotebook

미리보기: `/test/notebook` (테스트 목록 `/test`에도 등록).

Figma `13:11`의 736 × 920 원본을 `public/images/notebook/notebook.png`에 저장해 사용합니다. 중앙 링을 축으로 아래쪽 종이가 위로 회전합니다. 위쪽에는 직전 페이지가 표시됩니다.

```tsx
import ScrollNotebook, { type NotebookPage } from "@/components/notebook/ScrollNotebook";

const pages: NotebookPage[] = [{
  id: "first",
  elements: [
    {
      id: "message", type: "text", text: "우리의 이야기\n함께 시작해요",
      x: 8, y: 10, width: 80, fontFamily: "'My Handwriting', cursive",
      fontSize: 32, color: "#534c40", rotation: -3,
    },
    {
      id: "photo-1", type: "image", src: "/photos/first.jpg", alt: "첫 여행",
      x: 10, y: 42, width: 44, height: 48, rotation: -5, zIndex: 1,
    },
    {
      id: "photo-2", type: "image", src: "/photos/second.jpg", alt: "함께한 바다",
      x: 48, y: 48, width: 43, height: 44, rotation: 7, zIndex: 2,
      objectFit: "contain", borderRadius: 4,
    },
  ],
}];

<ScrollNotebook pages={pages} label="우리의 여행 기록" />
```

- 페이지는 최대 10장입니다. 초과 데이터는 처음 10장만 사용하며 빈 배열이면 표시하지 않습니다.
- `elements`의 개수 제한은 없습니다. 위치와 너비/높이는 페이지 내부 쓰기 영역의 백분율입니다. 회전은 도 단위, `zIndex`로 겹침 순서를 설정합니다.
- `fontSize`는 원본 너비 736px 기준 픽셀 크기입니다. 화면 크기에 따라 글씨와 배치가 함께 축소됩니다. `fontWeight`, `lineHeight`, `textAlign`도 설정할 수 있습니다.
- 원하는 웹폰트를 프로젝트에서 먼저 불러온 뒤 `fontFamily`에 전달하세요. 예제의 폰트명은 로컬 폰트가 없으면 대체 글꼴로 표시됩니다.
- 이미지는 `src`와 `alt`를 전달합니다. `height` 생략 시 이미지 원본 비율을 사용합니다. 같은 페이지에 여러 이미지를 자유롭게 배치할 수 있습니다.
- 스크롤 제스처 하나당 한 장씩 넘깁니다. 트랙패드 관성 스크롤은 연속 넘김을 방지합니다. 터치 스와이프, 위아래 방향키, PageUp/PageDown, 이전/다음 버튼도 지원합니다.
- 처음/마지막 페이지 밖으로 스크롤하면 바깥 문서 스크롤을 허용합니다. `prefers-reduced-motion`에서는 회전 애니메이션을 생략합니다.
- 페이지 데이터의 id는 고유하게 유지하세요. 다른 노트로 교체할 때는 React `key`를 변경하면 첫 페이지부터 시작합니다.
