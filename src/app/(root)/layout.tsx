import type { Metadata } from "next";
import { FooterRoot } from "./_components/Footer";
import { HeaderRoot } from "./_components/Header";

export const metadata: Metadata = {
  title: "Anotado - Home",
  description: "Crie e compartilhe suas anotações com quem quiser, DE GRAÇA!",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex flex-col min-h-dvh">
      <HeaderRoot />
      <main className="flex-1 grid w-full max-w-300 m-auto">{children}</main>
      <FooterRoot />
    </div>
  );
}
