"use client";

import Image from "next/image";
import ProductStudio from "../components/ProductStudio";
import { products } from "../data/catalog";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const store = "https://www.basyc.com.br";

function subscribeTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("basyc-theme-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("basyc-theme-change", onChange);
  };
}
function readTheme(): "light" | "graphite" {
  return document.documentElement.dataset.theme === "graphite" ? "graphite" : "light";
}
const serverTheme = () => "light" as const;


const categories = [
  { label: "Camisetas", href: "#pecas" },
  { label: "Calças", href: "#pecas" },
  { label: "Bermudas", href: "#pecas" },
  { label: "Plus size", href: `${store}/plus-size/` },
];

const reviews = [
  { quote: "Produto de boa qualidade e bonito. Ótimo custo x benefício.", name: "Renato Alexandre", product: "Camiseta Basyc Modal", date: "22/05/2026", href: `${store}/camiseta-basyc-modal/` },
  { quote: "Simplesmente absurda a qualidade, surpreendeu demais", name: "Vinicius Anacleto", product: "Camiseta Oversized Estonada", date: "26/08/2026", href: `${store}/camiseta-oversized-marmorizada/` },
  { quote: "O produto superou minhas expectativas: o tecido é macio, o acabamento é impecável e o caimento é perfeito.", name: "João Davi", product: "Work Shirt", date: "27/02/2026", href: `${store}/work-shirt/` },
  { quote: "Camisa muito estilosa, com caimento perfeito, sem contar com a excelente qualidade do produto.", name: "Ezicley da Costa", product: "Regata Basyc Canelada", date: "09/09/2026", href: `${store}/regata-basyc-fit/` },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function Home() {
  const stageRef = useRef<HTMLElement>(null);
  const markPositionRef = useRef<HTMLDivElement>(null);
  const markFaceRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLHeadingElement>(null);
  const exploreRef = useRef<HTMLAnchorElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const frameRef = useRef<number | null>(null);
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const fullMotion = true;
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [openProduct, setOpenProduct] = useState<number | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  const openProductDetail = (index: number) => {
    setSelectedProduct(index);
    setOpenProduct(index);
  };
  const closeProductDetail = useCallback(() => setOpenProduct(null), []);
  const focusCategory = (label: string) => {
    if (label === "Plus size") return;
    const index = label === "Calças" ? 2 : label === "Bermudas" ? 4 : 0;
    setSelectedProduct(index);
    const shelf = shelfRef.current;
    const card = shelf?.children[index] as HTMLElement | undefined;
    if (shelf && card) shelf.scrollTo({ left: card.offsetLeft - shelf.offsetLeft - (shelf.clientWidth - card.clientWidth) / 2, behavior: "smooth" });
  };

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem("basyc-theme");
      if (savedTheme === "light" || savedTheme === "graphite") {
        document.documentElement.dataset.theme = savedTheme;
      }
    } catch {
      document.documentElement.dataset.theme = "light";
    }
    window.dispatchEvent(new Event("basyc-theme-change"));
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const mark = markPositionRef.current;
    const tagline = taglineRef.current;
    const explore = exploreRef.current;
    const shelf = shelfRef.current;
    const brand = brandRef.current;
    if (!stage || !mark || !tagline || !explore || !shelf || !brand) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let progress = 0;
    let target = 0;
    let lastTime = 0;
    const smooth = (start: number, end: number, value: number) => {
      const t = clamp((value - start) / (end - start), 0, 1);
      return t * t * (3 - 2 * t);
    };
    const render = (time: number) => {
      const reduced = media.matches && !fullMotion;
      const dt = Math.min(time - (lastTime || time - 16), 64);
      lastTime = time;
      progress += (target - progress) * (reduced ? 1 : 1 - Math.exp(-dt / 85));
      if (Math.abs(target - progress) < 0.0001) progress = target;
      const slogan = 1 - smooth(0.06, 0.23, progress);
      const appear = smooth(0.22, 0.39, progress);
      const dock = smooth(0.48, 0.76, progress);
      const reveal = smooth(0.70, 0.94, progress);
      const rect = brand.getBoundingClientRect();
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const scale = rect.width / mark.offsetWidth;
      const x = (rect.left + rect.width / 2 - cx) * dock;
      const y = (rect.top + rect.height / 2 - cy) * dock;
      mark.style.opacity = String(appear * (reduced ? 1 - dock : 1));
      mark.style.transform = reduced ? "translate3d(-50%, -50%, 0)" :
        `translate3d(calc(-50% + ${x}px), calc(-50% + ${y + (1 - appear) * 60}px), 0) scale(${(0.92 + appear * 0.08) * (1 + (scale - 1) * dock)}) rotateX(${(1 - appear) * 24}deg) rotateY(${(1 - appear) * -24}deg)`;
      mark.style.pointerEvents = appear > 0.9 && dock < 0.8 ? "auto" : "none";
      tagline.style.opacity = String(slogan);
      tagline.style.transform = reduced ? "translate(-50%, -50%)" : `translate(-50%, calc(-50% - ${(1 - slogan) * 46}px)) scale(${1 - (1 - slogan) * 0.035})`;
      shelf.style.opacity = String(reveal);
      const remaining = 1 - reveal;
      const mobileShelf = window.innerWidth <= 700;
      const cardOffset = products.map((_, index) => (1 - smooth((index % 3) * .12, .82 + (index % 3) * .06, progress)) * [82, 54, 26][index % 3]);
      const cardLift = products.map((_, index) => (1 - smooth((index % 3) * .12, .82 + (index % 3) * .06, progress)) * [30, -12, 22][index % 3]);
      shelf.style.transform = reduced ? "none" : `translate3d(${mobileShelf ? 0 : remaining * 90}px, ${remaining * 45}px, 0)`;
      products.forEach((_, index) => {
        shelf.style.setProperty(`--card-parallax-${index}`, `${mobileShelf ? 0 : cardOffset[index]}px`);
        shelf.style.setProperty(`--card-lift-${index}`, `${mobileShelf ? 0 : cardLift[index]}px`);
      });
      shelf.inert = reveal < 0.8;
      const pastHero = stage.getBoundingClientRect().bottom < window.innerHeight;
      explore.style.opacity = String(pastHero ? 0 : reveal);
      explore.inert = pastHero || reveal < 0.8;
      brand.style.opacity = String(reduced ? dock : 0);
      stage.style.setProperty("--hint-opacity", String(1 - smooth(0, 0.09, progress)));
      stage.style.setProperty("--product-heading-opacity", String(reveal));
      frameRef.current = progress !== target ? requestAnimationFrame(render) : null;
    };
    const update = () => {
      const range = Math.max(1, stage.offsetHeight - window.innerHeight);
      target = clamp(-stage.getBoundingClientRect().top / range, 0, 1);
      if (frameRef.current === null) frameRef.current = requestAnimationFrame(render);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    media.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      media.removeEventListener("change", update);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [fullMotion]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "graphite" : "light";
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem("basyc-theme", nextTheme);
    } catch {
      // The control still works when storage is unavailable.
    }
    window.dispatchEvent(new Event("basyc-theme-change"));
  };

  const moveLight = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === "touch" || (window.matchMedia("(prefers-reduced-motion: reduce)").matches && !fullMotion)) return;
    const face = event.currentTarget;
    const rect = face.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    face.style.transition = "none";
    face.style.setProperty("--tilt-x", `${(0.5 - y) * 7}deg`);
    face.style.setProperty("--tilt-y", `${(x - 0.5) * 8}deg`);
    face.style.setProperty("--light-x", `${x * 100}%`);
    face.style.setProperty("--light-y", `${y * 100}%`);
    face.style.setProperty("--shine", "0.84");
  };

  const settleLight = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const face = event.currentTarget;
    face.style.transition = "transform 520ms cubic-bezier(0.22, 0.8, 0.3, 1), opacity 280ms ease-out";
    face.style.setProperty("--tilt-x", "0deg");
    face.style.setProperty("--tilt-y", "0deg");
    face.style.setProperty("--shine", "0");
  };


  const tiltProduct = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || (window.matchMedia("(prefers-reduced-motion: reduce)").matches && !fullMotion)) return;
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--glass-x", `${(x + 0.5) * 100}%`);
    card.style.setProperty("--glass-y", `${(y + 0.5) * 100}%`);
    card.style.setProperty("--tilt-x", `${-y * 3.5}deg`);
    card.style.setProperty("--tilt-y", `${x * 4.5}deg`);
  };

  const settleProduct = (event: ReactPointerEvent<HTMLElement>) => {
    const card = event.currentTarget;
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  };

  return (
    <>
      <header className="site-header">
        <a className="brand-mark r-brand-mark" href="#inicio" ref={brandRef} aria-label="Basyc — início">
          BASYC
        </a>

        <nav className="desktop-nav" aria-label="Categorias">
          {categories.map((category, index) => (
            <a
              className={`r-nav-${["shirts", "trousers", "shorts", "plus"][index]}`}
              href={category.href}
              onClick={() => focusCategory(category.label)}
              key={category.label}
            >
              {category.label}
            </a>
          ))}
        </nav>

        <button
          className="theme-toggle r-theme-control"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Ativar tema grafite" : "Ativar tema claro"}
          aria-pressed={theme === "graphite"}
          title={theme === "light" ? "Ativar tema grafite" : "Ativar tema claro"}
        >
          <span className={`theme-option ${theme === "light" ? "is-selected" : ""}`} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3.6" />
              <path d="M12 2.4v2M12 19.6v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M2.4 12h2m15.2 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
            </svg>
          </span>
          <span className={`theme-option ${theme === "graphite" ? "is-selected" : ""}`} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M19.8 15.3A8.6 8.6 0 0 1 8.7 4.2 8.6 8.6 0 1 0 19.8 15.3Z" />
            </svg>
          </span>
        </button>

        <a className="bag-link" href={`${store}/carrinho/`} aria-label="Abrir sacola">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5.2 8.4h13.6l1 12H4.2l1-12Z" />
            <path d="M8.5 9V6.6a3.5 3.5 0 0 1 7 0V9" />
          </svg>
          <span>Sacola</span>
        </a>

        <button
          className="mobile-menu-trigger"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-category-menu"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {menuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <nav className="mobile-nav-panel" id="mobile-category-menu" aria-label="Categorias" hidden={!menuOpen}>
          {categories.map((category) => (
            <a href={category.href} key={category.label} onClick={() => { setMenuOpen(false); focusCategory(category.label); }}>
              <span>{category.label}</span>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h13m-5-5 5 5-5 5" />
              </svg>
            </a>
          ))}
        </nav>
      </header>

      <div className="hero-mark-position" ref={markPositionRef} aria-hidden="true">
        <span
          className="hero-mark-face"
          ref={markFaceRef}
          data-mark="BASYC"
          onPointerMove={moveLight}
          onPointerLeave={settleLight}
          onTransitionEnd={(event) => {
            if (event.propertyName === "transform") event.currentTarget.style.transition = "";
          }}
        >
          {Array.from({ length: 18 }, (_, i) => (
            <span className="logo-depth" key={i} style={{ transform: `translateZ(${-i * 2}px)` }} aria-hidden="true">BASYC</span>
          ))}
          <span className="logo-front">BASYC</span>
        </span>
      </div>

      <main>
        <section className="scroll-story" id="inicio" ref={stageRef} aria-label="Basyc, o básico bem feito">
          <div className="hero-pin" inert={openProduct !== null}>
            <div className="hero-copy">
              <h1 className="tagline r-tagline" ref={taglineRef}>
                o básico bem feito
              </h1>
              <a className="explore-action r-explore-action" href="#pecas" ref={exploreRef}>
                Explorar essenciais
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4.5 12h14m-5.5-5.5L18.5 12 13 17.5" />
                </svg>
              </a>
            </div>

            <p className="scroll-invitation">Role para descobrir<span aria-hidden="true">↓</span></p>
            <h2 className="collection-title">Essenciais. Do seu jeito.</h2>
            <div className="shelf-navigation" aria-label="Navegar pelos produtos">
              <button type="button" aria-label="Produtos anteriores" onClick={() => shelfRef.current?.scrollBy({ left: -shelfRef.current.clientWidth * .76, behavior: "smooth" })}>←</button>
              <button type="button" aria-label="Próximos produtos" onClick={() => shelfRef.current?.scrollBy({ left: shelfRef.current.clientWidth * .76, behavior: "smooth" })}>→</button>
            </div>
            <div className="product-shelf" ref={shelfRef}>
              {products.map((product, index) => (
                <article
                  className={`product-card ${product.region} ${openProduct === index ? "product-open" : ""}`}
                  key={product.id}
                  onPointerMove={tiltProduct}
                  onPointerLeave={settleProduct}
                >
                  <a className="product-media" href="#produto-dedicado" onClick={(event) => { event.preventDefault(); openProductDetail(index); }} aria-label={`Ver ${product.name}`}>
                    <Image
                      src={product.image}
                      alt={product.alt}
                      fill
                      priority={index < 3}
                      sizes="(max-width: 700px) 76vw, 22vw"
                      className="product-photo"
                    />
                  </a>
                  <div className="product-glass" aria-hidden="true" />
                  <div className="product-copy">
                    <span className="shelf-price">A partir de R$ {product.price} no Pix</span>
                    <a className="product-name" href="#produto-dedicado" onClick={(event) => { event.preventDefault(); openProductDetail(index); }}>
                      {product.name}
                    </a>
                    <a className="product-action" href="#produto-dedicado" onClick={(event) => { event.preventDefault(); openProductDetail(index); }}>
                      Explorar detalhes
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4.5 12h14m-5.5-5.5L18.5 12 13 17.5" />
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <span id="pecas" className="collection-anchor" aria-hidden="true" />
        </section>
        <section className="campaign-section" id="promocoes" aria-labelledby="campaign-title">
          <div className="campaign-intro"><h2 id="campaign-title">O essencial, em novas combinações.</h2><p>Escolha as peças que acompanham seu ritmo. A condição de cada compra é confirmada na loja oficial.</p></div>
          <div className="campaign-grid">
            <article className="campaign-card campaign-dark">
              <Image src="/assets/campaign/black-november.webp" alt="Camiseta oversized preta, camiseta branca e calça cargo em composição editorial" fill sizes="(max-width: 700px) 100vw, 50vw" />
              <div className="campaign-copy"><h3>Black November</h3><p>Seus básicos favoritos, reunidos para a temporada.</p><a className="black-action" href={store}><span className="flame-field" aria-hidden="true">{Array.from({ length: 11 }, (_, i) => <i key={i} />)}</span><span className="black-action-label">Explorar a Black na loja <span aria-hidden="true">↗</span></span></a></div>
            </article>
            <article className="campaign-card campaign-light">
              <Image src="/assets/campaign/kits.webp" alt="Kit editorial com camisetas, work shirt e bermuda cargo" fill sizes="(max-width: 700px) 100vw, 50vw" />
              <div className="campaign-copy"><h3>Kits do seu jeito</h3><p>Monte sua seleção e ganhe até 20% OFF, conforme as condições da loja.</p><a href={store}>Montar meu kit <span aria-hidden="true">↗</span></a></div>
            </article>
          </div>
          <p className="campaign-note">Condição divulgada pela BASYC em 05/11/2026. Consulte produtos participantes, disponibilidade e regras na loja oficial.</p>
        </section>
        <section className="reviews-section" aria-labelledby="reviews-title">
          <div className="reviews-heading"><div><h2 id="reviews-title">Quem veste, conta.</h2><p>Relatos de clientes publicados na loja oficial.</p></div><div className="reviews-actions"><a href={`${store}/avaliacoes/`}>Ver todas as avaliações ↗</a><div className="reviews-arrows"><button type="button" aria-label="Avaliações anteriores" onClick={() => reviewsRef.current?.scrollBy({ left: -reviewsRef.current.clientWidth * .75, behavior: "smooth" })}>←</button><button type="button" aria-label="Próximas avaliações" onClick={() => reviewsRef.current?.scrollBy({ left: reviewsRef.current.clientWidth * .75, behavior: "smooth" })}>→</button></div></div></div>
          <div className="reviews-track" ref={reviewsRef} aria-label="Avaliações de clientes">
            {reviews.map(review => <figure className="review-card" key={`${review.name}-${review.product}`}><span className="review-source">Avaliação na loja oficial</span><blockquote>“{review.quote}”</blockquote><figcaption><strong>{review.name}</strong><span>{review.product} · {review.date}</span><a href={review.href}>Ver avaliação na loja ↗</a></figcaption></figure>)}
          </div>
        </section>
        <ProductStudio selected={selectedProduct} onSelect={setSelectedProduct} fullMotion={fullMotion} openProduct={openProduct} detailRef={detailRef} onClose={closeProductDetail} />
      </main>
      <footer className="site-footer" id="contato">
        <div className="footer-brand"><a href="#inicio">BASYC</a><p>o básico bem feito</p></div>
        <div className="footer-columns">
          <div><h2>Vamos conversar.</h2><a href="tel:+5511941830013">(11) 94183-0013</a><a href="mailto:basycbr@gmail.com">basycbr@gmail.com</a><p>Atendimento de segunda a sexta,<br />das 09h às 18h.</p></div>
          <div><h2>Encontre a Basyc.</h2><address>R. Santa Cruz, 255 — Vila Mariana<br />São Paulo · SP · 04121-000</address><p>Segunda a sábado, das 09h às 19h.<br />Domingo, das 09h às 17h.</p></div>
          <nav aria-label="Ajuda e informações"><h2>Conte com a gente.</h2><a href="https://basyc.troque.app.br">Trocas e devoluções</a><a href={`${store}/faq/`}>Dúvidas frequentes</a><a href={`${store}/central/dados/`}>Minha conta e pedidos</a><a href={`${store}/politica-privacidade/`}>Política de privacidade</a><a href={`${store}/m/quem-somos/`}>Quem somos</a></nav>
        </div>
        <div className="footer-bottom"><span>Basyc · São Paulo</span><a href="https://www.basyc.com.br/">Informações e compra na loja oficial ↗</a><a href="#inicio">Voltar ao início ↑</a></div>
      </footer>
    </>
  );
}
