"use client";

import { useMemo, useState } from "react";
import DiagramEditor from "./DiagramEditor";

type Process = {
  id: number;
  name: string;
  trigger: string;
  outcome: string;
  diagram_json: string;
};

function parseNodes(diagram_json: string): any[] {
  if (!diagram_json) return [];
  try {
    const d = JSON.parse(diagram_json);
    return Array.isArray(d.nodes) ? d.nodes : [];
  } catch {
    return [];
  }
}

export default function ProcessView(props: { p: Process }) {
  const [mode, setMode] = useState<"diagram" | "list">("diagram");

  const listItems = useMemo(() => {
    const nodes = parseNodes(props.p.diagram_json)
      .filter((n) => n.type === "box")
      .sort((a, b) => (a.position?.y ?? 0) - (b.position?.y ?? 0));

    return nodes.map((n) => ({
      title: n.data?.title || "Untitled",
      text: n.data?.text || ""
    }));
  }, [props.p.diagram_json]);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={() => setMode("diagram")} disabled={mode === "diagram"}>Diagram</button>
        <button onClick={() => setMode("list")} disabled={mode === "list"}>List view</button>
      </div>

      {mode === "diagram" ? (
        <DiagramEditor processId={props.p.id} initialDiagramJson={props.p.diagram_json || ""} />
      ) : (
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>Steps</h2>
          <ol>
            {listItems.map((x, idx) => (
              <li key={idx} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700 }}>{x.title}</div>
                {x.text ? <div style={{ fontSize: 14 }}>{x.text}</div> : null}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
