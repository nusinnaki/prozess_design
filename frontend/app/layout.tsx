export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", margin: 0, padding: 24 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <a href="/" style={{ marginRight: 12 }}>Home</a>
            <a href="/processes">Processes</a>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
