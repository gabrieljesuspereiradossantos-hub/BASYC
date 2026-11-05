"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductPhotos from "./ProductPhotos";
import { products } from "../data/catalog";
import type { RefObject } from "react";

const views = ["Frente", "Costas", "Costura", "Tecido"];

export default function ProductStudio({ selected, onSelect, fullMotion, openProduct, detailRef, onClose }: { selected: number; onSelect: (index: number) => void; fullMotion: boolean; openProduct: number | null; detailRef: RefObject<HTMLElement | null>; onClose: () => void }) {
  const [selection, setSelection] = useState({ product: selected, view: 0, direction: 1, color: 0 });
  if (selection.product !== selected) setSelection({ product: selected, view: 0, direction: 1, color: 0 });
  const shot = selection;
  const product = products[selected];
  const variant = product.variants?.[shot.color];
  const chooseView = (view: number) => setSelection(current => ({ ...current, view, direction: Math.sign(view - current.view) || 1 }));
  const step = useCallback((direction: number) => setSelection(current => ({ ...current, view: (current.view + direction + views.length) % views.length, direction })), []);
  const dedicatedRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (openProduct === null) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [openProduct, onClose]);
  useEffect(() => {
    const node = dedicatedRef.current;
    const shell = transitionRef.current;
    if (openProduct === null || !node || !shell) return;

    const card = document.querySelectorAll<HTMLElement>(".product-card")[openProduct];
    const rect = card?.getBoundingClientRect();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dx = rect ? rect.left + rect.width / 2 - width / 2 : 0;
    const dy = rect ? rect.top + rect.height / 2 - height / 2 : 0;
    const sx = rect ? Math.max(.08, rect.width / width) : .3;
    const sy = rect ? Math.max(.08, rect.height / height) : .3;

    shell.animate([
      { opacity: .94, backgroundColor: "color-mix(in srgb, var(--page-ground) 62%, transparent)", borderRadius: "28px", transform: `perspective(1200px) translate3d(${dx}px,${dy}px,0) scale(${sx},${sy}) rotateY(0deg)` },
      { opacity: 1, backgroundColor: "color-mix(in srgb, var(--page-ground) 92%, transparent)", borderRadius: "20px", transform: "perspective(1200px) translate3d(0,0,90px) scale(1.035) rotateY(155deg)", offset: .82 },
      { opacity: 1, backgroundColor: "var(--page-ground)", borderRadius: "0px", transform: "perspective(1200px) translate3d(0,0,0) scale(1) rotateY(180deg)" },
    ], { duration: 1900, easing: "cubic-bezier(.22,.68,.22,1)", fill: "both" });
    node.animate([
      { opacity: 0, transform: "translateY(20px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], { duration: 700, delay: 680, easing: "cubic-bezier(.22,.8,.3,1)", fill: "both" });
  }, [openProduct]);

  if (openProduct === null) return null;

  return <section ref={detailRef} className="product-detail-overlay" id="produto-dedicado" aria-labelledby="studio-title">
    <div ref={transitionRef} className="product-transition-shell" aria-hidden="true" />
    <div className="product-detail-backdrop" onClick={onClose} aria-hidden="true" />
    <div className="detail-topbar">
      <span className="detail-wordmark" aria-label="Basyc">BASYC</span>
      <button type="button" className="dedicated-close" onClick={onClose} aria-label="Voltar à vitrine">← Voltar à vitrine</button>
    </div>
    <div className="product-detail-panel" ref={dedicatedRef} role="dialog" aria-modal="true" aria-labelledby="studio-title">
      <div className="studio-camera" tabIndex={0} role="region" aria-label="Galeria de ângulos. Arraste para os lados ou use as setas." onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); step(event.key === "ArrowRight" ? 1 : -1); } }}>
        <ProductPhotos key={`${selected}-${variant?.name ?? "default"}`} product={selected} board={variant?.board} view={shot.view} direction={shot.direction} fullMotion={fullMotion} onStep={step} />
        <span className="camera-caption">{views[shot.view]} / {variant?.name ?? product.color}</span>
        <span className="camera-gesture-hint" aria-hidden="true">Arraste para explorar ↔</span>
        <button type="button" className="camera-arrow camera-prev" aria-label="Ângulo anterior" onClick={() => step(-1)}>‹</button>
        <button type="button" className="camera-arrow camera-next" aria-label="Próximo ângulo" onClick={() => step(1)}>›</button>
        <span className="concept-note">Imagens conceituais geradas por IA</span>
        <div className="camera-controls" aria-label="Ângulos da peça">
          {views.map((view, index) => <button key={view} type="button" aria-pressed={shot.view === index} onClick={() => chooseView(index)}>{view}</button>)}
        </div>
      </div>
      <div className="studio-details">
        <h1 id="studio-title">{product.name}</h1>
        <p className="product-editorial-copy">{product.fullDescription}</p>
        <dl className="piece-facts"><div><dt>Material</dt><dd>{product.material}</dd></div><div><dt>Em foco</dt><dd>{shot.view === 2 ? product.detail : views[shot.view]}</dd></div></dl>
        {product.variants && <div className="product-variants" aria-label="Cores conceituais"><p>Explorar cores <span>· imagens conceituais</span></p><div>{product.variants.map((option, index) => <button key={option.name} type="button" aria-label={option.name} aria-pressed={shot.color === index} onClick={() => setSelection(current => ({ ...current, color: index }))}><span className="variant-swatch" style={{ backgroundColor: option.swatch }} /><span>{option.name}</span></button>)}</div></div>}
        <div className="official-price"><span>A partir de</span><strong>R$ {product.price}</strong><span>no Pix · ou R$ {product.regular}</span></div>
        <a className="shop-piece" href={product.href}>Escolher tamanho na loja <span aria-hidden="true">↗</span></a>
        <p className="price-note">Preço de referência da loja, consultado em {selected >= 3 ? "04/11/2026" : "03/11/2026"}. Cor, tamanho e disponibilidade são confirmados na compra.</p>
        <nav className="detail-related" aria-label="Explorar outro produto">{products.map((item,index)=><button type="button" key={item.id} aria-current={selected===index} onClick={()=>onSelect(index)}>{item.name}</button>)}</nav>
      </div>
    </div>
    <div className="detail-bottom-bar">
      <div className="detail-bottom-identity"><strong>BASYC</strong><span>o básico bem feito</span></div>
      <nav aria-label="Navegação da vitrine"><a href="#pecas" onClick={onClose}>Camisetas</a><a href="#pecas" onClick={onClose}>Calças</a><a href="#pecas" onClick={onClose}>Bermudas</a></nav>
      <div className="detail-bottom-contact"><a href="tel:+5511941830013">(11) 94183-0013</a><a href="mailto:basycbr@gmail.com">basycbr@gmail.com</a></div>
      <a className="detail-instagram" href="https://www.instagram.com/basycbr/" target="_blank" rel="noopener noreferrer" aria-label="Visitar o Instagram da BASYC" onPointerMove={event => { if (event.pointerType === "touch") return; const icon = event.currentTarget.querySelector<HTMLElement>(".instagram-icon"); if (!icon) return; const rect = icon.getBoundingClientRect(); const x = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / (rect.width / 2))); const y = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height / 2) / (rect.height / 2))); icon.style.transform = `perspective(500px) rotateX(${-y * 16}deg) rotateY(${x * 16}deg)`; }} onPointerLeave={event => { const icon = event.currentTarget.querySelector<HTMLElement>(".instagram-icon"); if (icon) icon.style.transform = ""; }}>
        <span className="instagram-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><rect x="9" y="9" width="30" height="30" rx="9" stroke="currentColor" strokeWidth="3"/><circle cx="24" cy="24" r="7" stroke="currentColor" strokeWidth="3"/><circle cx="33" cy="15" r="2" fill="currentColor"/></svg></span>
        <span>Instagram <span aria-hidden="true">↗</span></span>
      </a>
    </div>
  </section>;
}
