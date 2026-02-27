import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anotado - Suas áreas de trabalho",
  description: "Crie e compartilhe suas anotações com quem quiser, DE GRAÇA!",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function WorkspaceLayout({ children }: RootLayoutProps) {
  return <>{children}</>;
}
