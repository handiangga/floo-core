export default function Card({ children }) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 12,
        background: "#fff",
        boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </div>
  );
}
