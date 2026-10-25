import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

const directory = dirname(fileURLToPath(import.meta.url));

// Compile just the two pure geometry modules; no browser or extra test package.
function compile(name, imports = {}) {
  const code = ts.transpileModule(readFileSync(join(directory, name), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  new Function('exports', 'require', code)(exports, name => {
    assert.ok(Object.hasOwn(imports, name), `Unexpected geometry dependency: ${name}`);
    return imports[name];
  });
  return exports;
}
const geometry = compile('notebook-geometry.ts');
const { pageFold, TRANSITION_SEGMENTS } = compile('paper-fold.ts', { './notebook-geometry': geometry });
const { RING_POSITIONS, RING_RADIUS, HOLE_ROW, PAPER_HEIGHT, PAPER_WIDTH, PAPER_HINGE } = geometry;
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
const pointNear = (a, b) => { near(a.x, b.x); near(a.y, b.y); near(a.z, b.z); };
const area = points => Math.abs(points.reduce((sum, p, index) => {
  const q = points[(index + 1) % points.length];
  return sum + p.x * q.y - q.x * p.y;
}, 0)) / 2;

function cssTransport(fold, point) {
  const match = fold.sheetTransform.match(/^translate3d\(([^c]+)cqw,([^c]+)cqw,([^c]+)cqw\)( rotateX\(180deg\))?$/);
  assert.ok(match, 'only static page-side orientation and binding translation are allowed');
  const side = match[4] ? -1 : 1;
  return { x: point.x + Number(match[1]), y: side * point.y + Number(match[2]), z: side * point.z + Number(match[3]) };
}

test('a full 180-degree U and reversed tail exist from the first drag frame', () => {
  for (const direction of [1, -1]) for (const progress of [.0001, .001, .01, .1, .3, .6, .9]) {
    const fold = pageFold(direction, progress, .8);
    near(fold.foldAngle, Math.PI);
    near(Math.abs(fold.parts.at(-1).rotation), Math.PI);
    near(fold.matrix[10], -1);
    assert.ok(area(fold.flap) > 0, 'already reversed paper follows the travelling U');
    assert.ok(fold.transition.some(part => area(part.points) > 0));
  }
});

test('all three holes remain threaded through the travelling U in actual CSS coordinates', () => {
  for (const direction of [1, -1]) for (const focus of [0, .25, .5, .75, 1]) for (let step = 0; step <= 200; step++) {
    const fold = pageFold(direction, step / 200, focus);
    for (const ring of RING_POSITIONS) {
      const source = { x: PAPER_WIDTH * ring / 100, y: HOLE_ROW, z: 0 };
      const expected = { x: source.x, y: PAPER_HINGE + fold.contact.y, z: fold.contact.z };
      pointNear(fold.transport(fold.bendPoint(source)), expected);
      pointNear(cssTransport(fold, fold.bendPoint(source)), expected);
      near((expected.y - PAPER_HINGE) ** 2 + expected.z ** 2, RING_RADIUS ** 2);
    }
    if (fold.contactAngle > 1e-8 && fold.contactAngle < Math.PI - 1e-8) near(fold.nx, 0);
  }
});

test('the moving boundary partitions the original paper without gaps or stretching', () => {
  for (const direction of [1, -1]) for (const focus of [0, .5, 1]) for (let step = 0; step <= 100; step++) {
    const fold = pageFold(direction, step / 100, focus);
    near(area(fold.front) + fold.parts.reduce((sum, part) => sum + area(part.points), 0), PAPER_WIDTH * PAPER_HEIGHT);
    for (let index = 0; index < fold.parts.length - 1; index++) {
      const part = fold.parts[index], next = fold.parts[index + 1];
      for (const x of [0, PAPER_WIDTH / 2, PAPER_WIDTH]) {
        const y = (fold.distance + next.offset - fold.nx * x) / fold.ny;
        if (y < 0 || y > PAPER_HEIGHT) continue;
        const point = { x, y, z: 0 };
        pointNear(part.bendPoint(point), next.bendPoint(point));
      }
    }
    for (const part of fold.parts) if (part.points.length > 1) {
      const a = { ...part.points[0], z: 0 }, b = { ...part.points[1], z: 0 };
      const aa = part.bendPoint(a), bb = part.bendPoint(b);
      near(Math.hypot(a.x - b.x, a.y - b.y), Math.hypot(aa.x - bb.x, aa.y - bb.y, aa.z - bb.z));
    }
  }
});

test('both directions start and finish flat without a separate unfold', () => {
  for (const direction of [1, -1]) for (const focus of [0, .5, 1]) for (const p of [0, 1]) {
    const fold = pageFold(direction, p, focus);
    const upper = direction > 0 ? p === 1 : p === 0;
    for (const x of [0, PAPER_WIDTH / 2, PAPER_WIDTH]) for (const y of [0, HOLE_ROW, PAPER_HEIGHT / 2, PAPER_HEIGHT]) {
      const actual = fold.transport(fold.bendPoint({ x, y, z: 0 }));
      pointNear(actual, { x, y: upper ? 2 * PAPER_HINGE - y : y, z: 0 });
    }
    if (p === 1) near(area(fold.flap), PAPER_WIDTH * PAPER_HEIGHT);
  }
});

test('the free body stays above the resting paper and clear of metal', () => {
  for (const direction of [1, -1]) for (const focus of [0, .5, 1]) for (let step = 0; step <= 100; step++) {
    const fold = pageFold(direction, step / 100, focus);
    for (const x of [0, ...RING_POSITIONS.map(r => PAPER_WIDTH * r / 100), PAPER_WIDTH]) {
      for (const y of [HOLE_ROW + 2, PAPER_HEIGHT * .15, PAPER_HEIGHT / 2, PAPER_HEIGHT * .75, PAPER_HEIGHT]) {
        const point = fold.transport(fold.bendPoint({ x, y, z: 0 }));
        assert.ok(point.z >= -1e-8);
        for (const ring of RING_POSITIONS) {
          const radial = Math.hypot(point.y - PAPER_HINGE, point.z) - RING_RADIUS;
          const separation = Math.hypot(point.x - PAPER_WIDTH * ring / 100, radial);
          assert.ok(separation > .425, 'free body cuts through a metal ring');
        }
      }
    }
  }
});

test('actual React output paints one travelling U with valid material clips', () => {
  const css = readFileSync(join(directory, 'ScrollNotebook.module.css'), 'utf8');
  const names = new Set([...css.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(match => match[1]));
  const styles = new Proxy({}, { get: (_, name) => { assert.ok(names.has(name), `Missing CSS class ${name}`); return name; } });
  const Sheet = compile('FoldingNotebookSheet.tsx', {
    react: React, 'react/jsx-runtime': jsxRuntime, './paper-fold': { pageFold },
    './ScrollNotebook.module.css': { default: styles },
  }).default;
  for (const direction of [1, -1]) for (const progress of [0, .001, .25, .5, .75, 1]) {
    const html = renderToStaticMarkup(React.createElement(Sheet, {
      direction, progress, focus: .1, target: null, duration: 0, onComplete() {},
    }, React.createElement('span', null, 'INK')));
    assert.equal((html.match(/class="foldFace front"/g) || []).length, TRANSITION_SEGMENTS + 2);
    assert.equal((html.match(/INK/g) || []).length, TRANSITION_SEGMENTS + 2);
    assert.doesNotMatch(html, /NaN|Infinity|undefined|<svg|foreignObject/);
  }
  assert.match(css, /transform-origin:\s*0 0/);
});

function dragModel() {
  const slots = [];
  let cursor = 0;
  const hooks = {
    memo: fn => fn, useEffect() {}, useMemo: fn => fn(),
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = value; }];
    },
    useRef(initial) {
      const index = cursor++;
      return slots[index] ||= { current: initial };
    },
  };
  const jsx = (type, props) => ({ type, props });
  const Notebook = compile('ScrollNotebook.tsx', {
    react: hooks, 'react/jsx-runtime': { jsx, jsxs: jsx },
    './FoldingNotebookSheet': { default() {} },
    './NotebookBinding': { ...geometry, default() {} },
    './ScrollNotebook.module.css': { default: {} },
  }).default;
  const render = () => {
    cursor = 0;
    return Notebook({ pages: [{ id: 'one', elements: [] }, { id: 'two', elements: [] }] }).props.children[0];
  };
  const node = {
    clientHeight: 800, setPointerCapture() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 800 }),
  };
  const event = (x, y) => ({ pointerId: 1, isPrimary: true, button: 0, clientX: x, clientY: y, currentTarget: node });
  return {
    start: (x, y) => render().props.onPointerDown(event(x, y)),
    move: (x, y) => render().props.onPointerMove(event(x, y)),
    get turn() { return slots[1]; },
  };
}

test('horizontal dragging immediately changes fold direction without advancing the page', () => {
  const drag = dragModel();
  drag.start(300, 700);
  assert.equal(drag.turn, null);
  drag.move(300, 400);
  const progress = drag.turn.progress;
  const centred = pageFold(1, progress, drag.turn.focus);
  drag.move(525, 400);
  const right = pageFold(1, drag.turn.progress, drag.turn.focus);
  near(drag.turn.progress, progress);
  assert.ok(right.nx > 0);
  drag.move(75, 400);
  const left = pageFold(1, drag.turn.progress, drag.turn.focus);
  near(drag.turn.progress, progress);
  assert.ok(left.nx < 0);
  assert.equal(right.sheetTransform, centred.sheetTransform);
  assert.equal(left.sheetTransform, centred.sheetTransform);
  near(left.matrix[10], right.matrix[10]);
});

test('different grab origins and drag histories produce the same final pose', () => {
  const a = dragModel(), b = dragModel();
  a.start(75, 700);
  a.move(225, 550);
  a.move(525, 400);
  b.start(525, 700);
  b.move(75, 300);
  b.move(525, 400);
  assert.deepEqual(a.turn, b.turn);
  assert.ok(!('curl' in a.turn) && !('anchor' in a.turn));
});


test('the U travels upward without growing a second fold at landing', () => {
  for (const direction of [1, -1]) for (const focus of [0, .5, 1]) {
    let previousFront = PAPER_WIDTH * PAPER_HEIGHT;
    let previousFlap = 0;
    for (let step = 0; step <= 200; step++) {
      const fold = pageFold(direction, step / 200, focus);
      const front = area(fold.front), flap = area(fold.flap);
      assert.ok(front <= previousFront + 1e-8);
      assert.ok(flap >= previousFlap - 1e-8);
      near(fold.foldAngle, Math.PI);
      previousFront = front;
      previousFlap = flap;
    }
    near(previousFront, 0);
    near(previousFlap, PAPER_WIDTH * PAPER_HEIGHT);
  }
});

test('paper layout and shared 3D depth survive renderer changes', () => {
  const css = readFileSync(join(directory, 'ScrollNotebook.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = selector => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(m => m[1].trim() === selector).map(m => m[2]).join('\n');
  assert.match(rule('.scene'), /transform-style:\s*preserve-3d/);
  assert.match(rule('.foldSheet'), /transform-style:\s*preserve-3d/);
  assert.match(rule('.foldSheet'), /transform-origin:\s*0 0/);
  assert.doesNotMatch(rule('.foldSheet'), /z-index|filter:|opacity:/);
  for (const name of ['.content', '.text, .image', '.upper, .lower']) assert.match(rule(name), /position:\s*absolute/);
});
