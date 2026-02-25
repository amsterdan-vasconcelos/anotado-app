import { Button } from "@/components/ui/button";

export const HeaderRoot = () => {
  return (
    <header className="flex justify-between w-full max-w-300 m-auto">
      <div>Logo</div>
      <Button>Entrar</Button>
    </header>
  );
};
