"use client";

import { useEffect, useState } from "react";

type Process = {
  id: number;
  process_key: string;
  name: string;
  trigger: string;
  outcome: string;
};

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [busy, setBusy] = useState(false);
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  async function load() {
    const res = await fetch(`${base}/processes`, { cache: "no-store" });
    const data = await res.json();
    setProcesses(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function createProcess() {
    setBusy(true);
    const now = Date.now();
    const payload = {
      process_key: `p_${now}`,
      name: `New process ${now}`,
      trigger: "",
      outcome: "",
      description: ""
    };

    const res = await fetch(`${base}/processes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setBusy(false);

    if (!res.ok) {
      alert(await res.text());
      return;
    }

    const data = await res.json();
    window.location.href = `/processes/${data.id}`;
  }

  return (
    <div>
      <h1>Processes</h1>

      <div style={{ marginBottom: 16 }}>
        <button onClick={createProcess} disabled={busy}>
          Create a process
        </button>
      </div>

      <div style={{ borderTop: "1px solid #ddd" }}>
        {processes.map((p) => (
          <div key={p.id} style={{ padding: "10px 0", borderBottom: "1px solid #ddd" }}>
            <div style={{ fontWeight: 700 }}>
              <a href={`/processes/${p.id}`}>{p.name}</a>
            </div>
            <div style={{ fontSize: 14 }}><b>Trigger:</b> {p.trigger}</div>
            <div style={{ fontSize: 14 }}><b>Outcome:</b> {p.outcome}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
