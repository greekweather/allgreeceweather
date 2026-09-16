import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AllGreeceWeather',
  description: 'Μετεωρολογικές αναλύσεις, προγνώσεις και άρθρα για τον καιρό στην Ελλάδα.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="el">
      <body>
        <a className="skip-link" href="#content">Μετάβαση στο περιεχόμενο</a>
        <header className="site-header">
          <div className="container header-inner">
            <a className="brand" href="/" aria-label="Αρχική σελίδα AllGreeceWeather">AllGreeceWeather</a>
            <nav className="site-nav" aria-label="Κύρια πλοήγηση">
              <a href="/">Αρχική</a>
              <a href="/posts">Άρθρα</a>
              <a href="/maps">Χάρτες</a>
            </nav>
          </div>
        </header>
        <main id="content">{children}</main>
        <footer className="site-footer">
          <div className="container footer-inner">
            <div><strong>AllGreeceWeather</strong><span> · {new Date().getFullYear()}</span></div>
            <div>Μετεωρολογία και καιρός στην Ελλάδα</div>
          </div>
        </footer>
      </body>
    </html>
  )
}
