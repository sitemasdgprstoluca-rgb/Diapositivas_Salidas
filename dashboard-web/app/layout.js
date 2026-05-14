import './globals.css';
import ThemeProvider from '../components/ThemeProvider';

export const metadata = {
  title: 'Dashboard Supervisión C.P.R.S.',
  description: 'Analítica institucional de supervisiones penitenciarias',
};

// Evita FOUC al hidratar el tema antes de pintar.
const noFlashScript = `
(function(){
  try {
    var stored = localStorage.getItem('theme');
    var prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefers ? 'dark' : 'dark');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch(e){}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
