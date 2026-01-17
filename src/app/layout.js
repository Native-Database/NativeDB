import "./globals.css";

export const metadata = {
  title: "Vey DB | Game Native Explorer",
  description: "A fast and powerful database explorer for GTA V, RDR2, RDR, Max Payne 3, and GTA IV.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="aurora-bg">
          <div className="aurora-item"></div>
          <div className="aurora-item"></div>
          <div className="aurora-item"></div>
        </div>
        <main className="relative min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
