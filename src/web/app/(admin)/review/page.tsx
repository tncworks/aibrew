'use client';

import { useEffect, useState } from 'react';

export default function ReviewPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/v1/review/queue');
      const json = await res.json();
      setItems(json.items || []);
    };
    load();
  }, []);

  return (
    <main>
      <h1>自動品質ゲート監視</h1>
      <table>
        <thead>
          <tr>
            <th>タイトル</th>
            <th>状態</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
