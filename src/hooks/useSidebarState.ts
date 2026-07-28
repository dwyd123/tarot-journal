import { useState } from "react";

const SIDEBAR_COLLAPSED_KEY = "tarot-journal:sidebar-collapsed";

function readStoredSidebarState(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
}

/** 记住电脑端侧边栏的展开或收起状态。 */
export function useSidebarState() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    readStoredSidebarState,
  );

  function toggleSidebar(): void {
    setIsSidebarCollapsed((current) => {
      const next = !current;

      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // 浏览器禁止本地存储时，当前页面内仍可正常切换。
      }

      return next;
    });
  }

  return {
    isSidebarCollapsed,
    toggleSidebar,
  };
}
