import Link from "next/link";

export const HeaderRoot = () => {
  return (
    <header className="flex justify-between w-full max-w-300 m-auto">
      <div>Logo</div>
      <Link href={"/workspace-collection"}>Entrar</Link>
    </header>
  );
};
