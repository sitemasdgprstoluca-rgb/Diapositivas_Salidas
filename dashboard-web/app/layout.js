import './globals.css';

export const metadata = {
  title: 'Dashboard Supervisión C.P.R.S.',
  description: 'Analítica institucional de supervisiones penitenciarias',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
