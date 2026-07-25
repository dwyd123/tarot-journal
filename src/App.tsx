import { SPREAD_TEMPLATES } from "./data/spreadTemplates";
import { TAROT_CARDS } from "./data/tarotCards";

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

        <section className="data-summary" aria-labelledby="data-summary-title">
          <p className="data-summary-title" id="data-summary-title">
            基础数据状态
          </p>
          <div className="data-summary-items">
            <p>
              <strong>{TAROT_CARDS.length}</strong>
              <span>张塔罗牌已载入</span>
            </p>
            <p>
              <strong>{SPREAD_TEMPLATES.length}</strong>
              <span>个内置牌阵已载入</span>
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
