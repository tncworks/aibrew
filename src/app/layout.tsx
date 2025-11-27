import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'AI Brew Digest',
  description: '生成AIニュースの07:00 JSTダイジェスト',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
