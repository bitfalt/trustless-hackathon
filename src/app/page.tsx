export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "3rem", lineHeight: 1.5 }}>
      <p style={{ textTransform: "uppercase", letterSpacing: "0.12em", color: "#2563eb" }}>OpenLab API</p>
      <h1>Fund science. Verify evidence. Unlock impact.</h1>
      <p>
        Backend is ready under <code>/api</code>. React UI can consume the seeded experiments, milestone evidence,
        verifier approval, and Trustless Work escrow routes.
      </p>
      <ul>
        <li><code>GET /api/experiments</code></li>
        <li><code>GET /api/experiments/waterwatch-costa-rica</code></li>
        <li><code>POST /api/escrow/create</code></li>
        <li><code>POST /api/escrow/fund</code></li>
      </ul>
    </main>
  );
}
