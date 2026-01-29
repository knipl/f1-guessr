export default function App() {
  return (
    <main className="page">
      <header className="hero">
        <p className="tag">F1 Guessr</p>
        <h1>Predict the top 10 before Q1.</h1>
        <p className="sub">
          Vote once per race, edit until qualifying starts, and compare results after the
          chequered flag.
        </p>
      </header>
      <section className="card">
        <h2>Next steps</h2>
        <ol>
          <li>Wire up auth (email + OAuth).</li>
          <li>Connect to the schedule API.</li>
          <li>Build the voting flow.</li>
        </ol>
      </section>
    </main>
  );
}
