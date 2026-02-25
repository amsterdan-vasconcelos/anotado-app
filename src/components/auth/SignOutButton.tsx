import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";

export function LogoutForm() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="flex items-center gap-2 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-50 transition-colors font-medium"
      >
        <LogOut size={20} />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </form>
  );
}
