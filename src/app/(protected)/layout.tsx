import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anotado - Home",
  description: "Crie e compartilhe suas anotações com quem quiser, DE GRAÇA!",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return <>{children}</>;
}
