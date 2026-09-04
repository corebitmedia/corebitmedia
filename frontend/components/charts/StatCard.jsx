export default function StatCard({ label, value }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)' }}>{value}</div>
      <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{label}</div>
    </div>
  );
}
