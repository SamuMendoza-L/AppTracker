import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Plan Maestro · Progreso',
  description: 'Seguimiento de progreso diario, semanal y por objetivos personalizados.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
