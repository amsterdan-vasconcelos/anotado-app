import { MODE_CONFIG } from "./LeftSidebar";

type TopBar = {
  mode: "view" | "create" | "edit";
};

const TopBar = ({ mode }: TopBar) => {
  const cfg = MODE_CONFIG[mode];
  const ModeIcon = cfg.Icon;

  return (
    <div
      className={`shrink-0 flex items-center gap-2.5 px-5 h-9 border-b ${cfg.topBarBg}`}
    >
      <ModeIcon size={13} className={cfg.topBarText} />
      <span className={`text-xs font-semibold tracking-wide ${cfg.topBarText}`}>
        {cfg.topBarLabel}
      </span>
    </div>
  );
};

export { TopBar };
