import Link from 'next/link';

export default function Home() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <main>
      <h1>AI Brew Digest</h1>
      <p>
        最新版のダイジェストは{' '}
        <Link href={`/digest/${today}`}>/digest/{today}</Link> から参照できます。
      </p>
    </main>
  );
}
