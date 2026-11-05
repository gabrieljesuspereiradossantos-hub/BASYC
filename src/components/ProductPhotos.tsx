"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { products } from "../data/catalog";

const views = ["Frente", "Costas", "Costura", "Tecido"];
type Props = { product: number; board?: string; view: number; direction: number; fullMotion: boolean; onStep: (direction: number) => void };

export default function ProductPhotos({ product, board, view, direction, fullMotion, onStep }: Props) {
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const initialized = useRef(false);
  const drag = useRef<{ x: number; y: number; active: boolean; base: number } | null>(null);
  const active = product * views.length + view;

  useLayoutEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches && !fullMotion;
    const duration = !initialized.current ? 0 : reduced ? .18 : 1.05;
    initialized.current = true;
    const tl = gsap.timeline({ paused: true });
    timeline.current = tl;
    layers.current.forEach((layer, index) => {
      if (!layer) return;
      gsap.killTweensOf(layer);
      const visible = Number(gsap.getProperty(layer, "opacity")) > .001;
      if (index === active) {
        if (!visible) gsap.set(layer, { x: 0, xPercent: reduced ? 0 : direction * 18, scale: reduced ? 1 : view >= 2 ? 1.42 : 1.12, rotation: reduced ? 0 : direction * .6, transformOrigin: view === 2 ? "50% 25%" : "50% 50%" });
        layer.style.zIndex = "2";
        tl.to(layer, { opacity: 1, duration: Math.min(duration, .55), ease: "sine.inOut" }, 0);
        tl.to(layer, { x: 0, xPercent: 0, scale: 1, rotation: 0, duration, ease: "power3.out" }, 0);
      } else if (visible) {
        layer.style.zIndex = "1";
        tl.to(layer, { opacity: 0, xPercent: reduced ? 0 : -direction * 22, scale: reduced ? 1 : view >= 2 ? 1.65 : 1.12, rotation: reduced ? 0 : -direction * .6, duration: reduced ? duration : .65, ease: "sine.inOut" }, 0);
      }
    });
    tl.play();
    return () => { tl.kill(); };
  }, [active, direction, fullMotion, view]);

  useLayoutEffect(() => {
    const nodes = layers.current;
    return () => { nodes.forEach(node => { if (node) gsap.killTweensOf(node); }); };
  }, []);

  return <div className="photo-gallery" onPointerDown={event => {
    if (event.button !== 0) return;
    const layer = layers.current[active];
    drag.current = { x: event.clientX, y: event.clientY, active: false, base: layer ? Number(gsap.getProperty(layer, "x")) : 0 };
  }} onPointerMove={event => {
    const gesture = drag.current;
    if (!gesture) return;
    const dx = event.clientX - gesture.x;
    if (!gesture.active) {
      if (Math.abs(event.clientY - gesture.y) > Math.abs(dx) && Math.abs(event.clientY - gesture.y) > 8) { drag.current = null; return; }
      if (Math.abs(dx) < 8) return;
      gesture.active = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      timeline.current?.pause();
    }
    const layer = layers.current[active];
    if (layer && !(matchMedia("(prefers-reduced-motion: reduce)").matches && !fullMotion)) {
      gsap.killTweensOf(layer);
      gsap.set(layer, { x: gesture.base + dx });
    }
  }} onPointerUp={event => {
    const gesture = drag.current;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!gesture?.active) return;
    const dx = event.clientX - gesture.x;
    if (Math.abs(dx) > event.currentTarget.clientWidth * .14) onStep(dx < 0 ? 1 : -1);
    else {
      timeline.current?.resume();
      const layer = layers.current[active];
      if (layer) gsap.to(layer, { x: 0, duration: .3, ease: "power3.out", overwrite: "auto" });
    }
  }} onPointerCancel={() => {
    drag.current = null;
    timeline.current?.resume();
    const layer = layers.current[active];
    if (layer) gsap.to(layer, { x: 0, duration: .3, ease: "power3.out", overwrite: "auto" });
  }}>
    {products.flatMap((item, productIndex) => views.map((label, viewIndex) => <div key={`${item.id}-${label}`} ref={node => { layers.current[productIndex * views.length + viewIndex] = node; }} className={`camera-layer cinema-layer ${active === productIndex * views.length + viewIndex ? "camera-in" : ""}`} aria-hidden={active !== productIndex * views.length + viewIndex}>
      {item.board ? <div className={`studio-board-panel studio-board-panel-${viewIndex}`} role="img" aria-label={`${item.name}: ${label}, imagem conceitual`} style={{ backgroundImage: `url(${productIndex === product ? board ?? item.board : item.board})` }} /> : viewIndex === 0 || viewIndex === 1 ? (
        // The approved transparent cutouts keep their original proportions.
        // eslint-disable-next-line @next/next/no-img-element
        <img className={`studio-front ${viewIndex === 1 ? "studio-back-image" : ""}`} src={viewIndex === 1 ? item.backImage : item.image} alt={`${item.name} — ${label.toLowerCase()}, imagem conceitual`} draggable={false} />
      ) : <div className={`studio-atlas ${viewIndex === 1 ? "back-view" : ""}`} role="img" aria-label={`${item.name}: ${label}, imagem conceitual`} style={{ backgroundImage: `url(${item.atlas})`, backgroundPosition: `${(viewIndex - 1) * 50}% center` }} />}
    </div>))}
  </div>;
}
