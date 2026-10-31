import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/navigation/Navbar';

export const metadata: Metadata = {
  title: 'ArchiTech | AI Spatial Intelligence & 3D Interior Design',
  description:
    'Transform room photos into editable 3D environments with geometric validation, voice-driven modifications, and tailored furniture recommendations.',
  keywords: [
    'ArchiTech',
    'Spatial Intelligence',
    '3D Reconstruction',
    'PURE Pi3',
    'YOLO11',
    'Interior Design',
    'AWS Builder Center',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#16191f] text-white min-h-screen flex flex-col font-ember antialiased">
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
