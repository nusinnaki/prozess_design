"use client";

import { Handle, Position, NodeProps } from "reactflow";

type BoxData = {
  title?: string;
  text?: string;
  bg?: string;
  onChange?: (id: string, patch: Partial<BoxData>) => void;
};

export default function EditableBoxNode(props: NodeProps<BoxData>) {
  const { data, id } = props;

  return (
    <div style={{
      width: 260,
      border: "1px solid #333",
      borderRadius: 10,
      padding: 10,
      background: data.bg || "#fff"
    }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <input
          value={data.title || ""}
          onChange={(e) => data.onChange?.(id, { title: e.target.value })}
          placeholder="Title"
          style={{ width: "100%", fontWeight: 700 }}
        />
      </div>
      <textarea
        value={data.text || ""}
        onChange={(e) => data.onChange?.(id, { text: e.target.value })}
        placeholder="Write step details"
        rows={5}
        style={{ width: "100%", resize: "vertical" }}
      />
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <input
          value={data.bg || ""}
          onChange={(e) => data.onChange?.(id, { bg: e.target.value })}
          placeholder="bg color (optional, e.g. #f2f2f2)"
          style={{ width: "100%" }}
        />
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
