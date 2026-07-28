interface PlaceholderPageProps {
  page: "calendar" | "settings";
}

const SETTINGS_ITEMS = [
  "外观",
  "数据与备份",
  "登录与同步",
  "关于应用",
];

export function PlaceholderPage({ page }: PlaceholderPageProps) {
  if (page === "calendar") {
    return (
      <section className="placeholder-page" aria-labelledby="calendar-title">
        <p className="section-kicker">规划中</p>
        <h1 id="calendar-title">日历</h1>
        <p>日历视图将在后续阶段加入。</p>
        <ul>
          <li>查看某天是否有记录</li>
          <li>点击日期查看当天案例</li>
        </ul>
      </section>
    );
  }

  return (
    <section className="placeholder-page" aria-labelledby="settings-title">
      <p className="section-kicker">我的</p>
      <h1 id="settings-title">设置</h1>
      <p>这些功能会在后续版本逐步加入。</p>
      <div className="placeholder-page__settings">
        {SETTINGS_ITEMS.map((item) => (
          <div key={item}>
            <span>{item}</span>
            <small>即将推出</small>
          </div>
        ))}
      </div>
    </section>
  );
}
