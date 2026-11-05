import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Basyc — o básico bem feito",
  description: "Básicos versáteis em diferentes modelagens e tamanhos.",
  icons: {
    icon: "/products/basyc-logo.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-theme="light">
      <head>
        {/* Basyc provides both themes; prevent a second color inversion. */}
        <meta name="darkreader-lock" />
      </head>
      <body>{children}</body>
    </html>
  );
}
