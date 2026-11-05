# BASYC — o básico bem feito

Site editorial e vitrine interativa da BASYC, marca de básicos versáteis. A experiência apresenta uma identidade visual em temas claro e grafite, movimento guiado pela rolagem e páginas de produto com galeria de ângulos.

## Desenvolvimento local

Requisitos: Node.js compatível com Next.js 16 e npm.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Para gerar a versão de produção:

```bash
npm run build
npm run start
```

## Estrutura

- `src/app/`: página, layout e estilos globais.
- `src/components/`: galeria e experiência dedicada do produto.
- `src/data/catalog.ts`: catálogo, descrições, preços e links oficiais.
- `public/assets/`: fotografias conceituais e imagens dos produtos.
- `public/fonts/`: tipografia Geom e respectiva licença.

As imagens de produto são conceituais. Preços, disponibilidade, tamanhos e compra devem ser confirmados na loja oficial.
