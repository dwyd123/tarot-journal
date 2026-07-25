function App() {
  return (
    <main className="app-shell">
      <section className="intro-card" aria-labelledby="app-title">
        <div className="brand-mark" aria-hidden="true">
          ✦
        </div>

        <p className="eyebrow">Tarot Journal</p>
        <h1 id="app-title">塔罗案例手记</h1>
        <p className="description">
          用于记录、整理与复盘塔罗咨询案例的中文网页应用。
        </p>

        <div className="status" role="status">
          <span className="status-dot" aria-hidden="true" />
          项目正在开发中
        </div>
      </section>
    </main>
  );
}

export default App;
