function DashboardStats() {
  return (
    <section className="dashboard-stats">
      <div className="stat-card stitches-card">
        <span className="eyebrow">THIS MONTH</span>
        <h2>1,842</h2>
        <p>stitches made</p>
        <div className="stat-progress">
          <div />
        </div>
      </div>

      <div className="stat-card stash-card">
        <span className="eyebrow">YOUR STASH</span>
        <h2>46</h2>
        <p>DMC colors tracked</p>
        <a href="/inventory">View inventory →</a>
      </div>
    </section>
  );
}

export default DashboardStats;
