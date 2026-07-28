import type { ReactNode } from "react";
import { useSidebarState } from "../hooks/useSidebarState";
import type { AppView } from "../types/navigation";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { MobileCreateButton } from "./MobileCreateButton";

interface AppShellProps {
  caseCount: number;
  children: ReactNode;
  personalMeaningCount: number;
  view: AppView;
  onNavigate: (view: AppView) => void;
}

export function AppShell({
  caseCount,
  children,
  personalMeaningCount,
  view,
  onNavigate,
}: AppShellProps) {
  const showMobileNavigation = view.name !== "edit";
  const { isSidebarCollapsed, toggleSidebar } = useSidebarState();

  return (
    <div
      className={`app-shell${isSidebarCollapsed ? " is-sidebar-collapsed" : ""}`}
    >
      <DesktopSidebar
        caseCount={caseCount}
        isCollapsed={isSidebarCollapsed}
        personalMeaningCount={personalMeaningCount}
        view={view}
        onNavigate={onNavigate}
        onToggle={toggleSidebar}
      />

      <main className="app-main">
        <div className="app-main__content">{children}</div>
        <footer className="scope-note">
          <span aria-hidden="true">✦</span>
          <p>
            所有案例和个人牌意仅保存在当前浏览器；暂不包含云端同步和登录。
          </p>
        </footer>
      </main>

      {showMobileNavigation && (
        <MobileBottomNavigation view={view} onNavigate={onNavigate} />
      )}

      {(view.name === "list" || view.name === "favorites") && (
        <MobileCreateButton
          onCreate={() => onNavigate({ name: "create" })}
        />
      )}
    </div>
  );
}
