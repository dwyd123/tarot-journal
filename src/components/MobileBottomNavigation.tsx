import type { AppView } from "../types/navigation";

interface MobileBottomNavigationProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
}

const ITEMS = [
  { label: "案例", icon: "▤", view: { name: "list" } as AppView },
  { label: "日历", icon: "□", view: { name: "calendar" } as AppView },
  { label: "牌库", icon: "◇", view: { name: "deck" } as AppView },
  { label: "我的", icon: "○", view: { name: "settings" } as AppView },
];

function isItemActive(currentView: AppView, targetView: AppView): boolean {
  if (targetView.name === "list") {
    return (
      currentView.name === "list" ||
      currentView.name === "favorites" ||
      currentView.name === "create" ||
      currentView.name === "detail"
    );
  }

  return currentView.name === targetView.name;
}

export function MobileBottomNavigation({
  view,
  onNavigate,
}: MobileBottomNavigationProps) {
  return (
    <nav className="mobile-bottom-navigation" aria-label="手机主要页面">
      {ITEMS.map((item) => {
        const isActive = isItemActive(view, item.view);

        return (
          <button
            className={isActive ? "is-active" : ""}
            key={item.label}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onNavigate(item.view)}
          >
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.label}</small>
          </button>
        );
      })}
    </nav>
  );
}
