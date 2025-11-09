export const metadata = {
  title: "Physics: Work, Energy, Power & Simple Machines",
  description: "Interactive explanations and calculators for work, energy, power, levers, and electricity bills.",
};

import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <h1>Work, Energy, Power & Simple Machines</h1>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <p>Built for learning ? Next.js on Vercel</p>
        </footer>
      </body>
    </html>
  );
}
