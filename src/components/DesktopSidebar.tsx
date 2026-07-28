import type { AppView, AppViewName } from "../types/navigation";

interface DesktopSidebarProps {
  caseCount: number;
  isCollapsed: boolean;
  personalMeaningCount: number;
  view: AppView;
  onNavigate: (view: AppView) => void;
  onToggle: () => void;
}

interface SidebarItem {
  label: string;
  icon: string;
  viewName: AppViewName;
}

const MAIN_ITEMS: SidebarItem[] = [
  { label: "我的案例", icon: "▤", viewName: "list" },
  { label: "收藏案例", icon: "★", viewName: "favorites" },
  { label: "日历", icon: "□", viewName: "calendar" },
  { label: "新建案例", icon: "＋", viewName: "create" },
  { label: "我的牌库", icon: "◇", viewName: "deck" },
];

function isItemActive(view: AppView, viewName: AppViewName): boolean {
  if (viewName === "list") {
    return (
      view.name === "list" ||
      view.name === "detail" ||
      view.name === "edit"
    );
  }

  return view.name === viewName;
}

export function DesktopSidebar({
  caseCount,
  isCollapsed,
  personalMeaningCount,
  view,
  onNavigate,
  onToggle,
}: DesktopSidebarProps) {
  return (
    <aside
      className="desktop-sidebar"
      aria-label={isCollapsed ? "已收起的侧边栏" : "侧边栏"}
    >
      <div className="desktop-sidebar__brand">
        <div className="desktop-sidebar__brand-identity">
          <span className="desktop-sidebar__brand-mark" aria-hidden="true">
            ✦
          </span>
          <div className="desktop-sidebar__brand-copy">
            <strong>塔罗案例手记</strong>
            <small>Tarot Journal</small>
          </div>
        </div>

        <button
          className="desktop-sidebar__toggle"
          type="button"
          aria-label={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
          data-tooltip={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
          onClick={onToggle}
        >
          <span aria-hidden="true">{isCollapsed ? "☰" : "«"}</span>
        </button>
      </div>

      <nav className="desktop-sidebar__navigation" aria-label="主要页面">
        {MAIN_ITEMS.map((item) => {
          const isActive = isItemActive(view, item.viewName);

          return (
            <button
              className={isActive ? "is-active" : ""}
              key={item.viewName}
              type="button"
              aria-current={isActive ? "page" : undefined}
              title={isCollapsed ? item.label : undefined}
              onClick={() => onNavigate({ name: item.viewName } as AppView)}
            >
              <span className="desktop-sidebar__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="desktop-sidebar__label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="desktop-sidebar__summary" aria-label="本地数据状态">
        <p>
          <strong>{caseCount}</strong>
          <span>条本地案例</span>
        </p>
        <p>
          <strong>{personalMeaningCount}</strong>
          <span>张个人牌意</span>
        </p>
      </div>

      <nav
        className="desktop-sidebar__secondary"
        aria-label="设置与账户"
      >
        <button
          className={view.name === "settings" ? "is-active" : ""}
          type="button"
          aria-current={view.name === "settings" ? "page" : undefined}
          title={isCollapsed ? "设置" : undefined}
          onClick={() => onNavigate({ name: "settings" })}
        >
          <span className="desktop-sidebar__icon" aria-hidden="true">
            ⚙
          </span>
          <span className="desktop-sidebar__label">设置</span>
        </button>
        <button
          type="button"
          title={isCollapsed ? "登录 / 个人账户" : undefined}
          onClick={() => onNavigate({ name: "settings" })}
        >
          <span className="desktop-sidebar__icon" aria-hidden="true">
            ○
          </span>
          <span className="desktop-sidebar__label">登录 / 个人账户</span>
        </button>
      </nav>
    </aside>
  );
}
