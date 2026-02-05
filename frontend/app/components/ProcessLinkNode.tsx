"use client";

import { Handle, Position, NodeProps } from "reactflow";

type LinkData = {
  label?: string;
  targetProcessId?: number;
  options?: { id: number; name: string }[];
  onChange?: (id: string, patch: Partial<LinkData>) => void;
};

export default function ProcessLinkNode(props: NodeProps<LinkData>) {
  const { data, id } = props;

  return (
    <div style={{
      width: 300,
      border: "2px solid #000",
      borderRadius: 10,
      padding: 10,
      background: "#f7f7f7"
    }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Link to process</div>

      <input
        value={data.label || ""}
        onChange={(e) => data.onChange?.(id, { label: e.target.value })}
        placeholder="Label"
        style={{ width: "100%", marginBottom: 8 }}
      />

      <select
        value={data.targetProcessId || ""}
        onChange={(e) => data.onChange?.(id, { targetProcessId: Number(e.target.value) })}
        style={{ width: "100%" }}
      >
        <option value="" disabled>Select target process</option>
        {(data.options || []).map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>

      <div style={{ marginTop: 8, fontSize: 12 }}>
        This node represents a binding to another process.
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
