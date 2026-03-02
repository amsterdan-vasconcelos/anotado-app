import type { Metadata } from "next";
import { FooterRoot } from "@/modules/root/components/Footer";
import { HeaderRoot } from "@/modules/root/components/Header";

export const metadata: Metadata = {
  title: "Ônix — sabor obsidian",
  description:
    "Anote, organize e compartilhe com o GitHub como backend. Grátis, pra sempre.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex flex-col min-h-dvh">
      <HeaderRoot />
      <main className="flex-1 w-full">{children}</main>
      <FooterRoot />
    </div>
  );
}
