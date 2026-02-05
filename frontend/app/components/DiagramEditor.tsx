"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Edge,
  Connection,
  Node,
  useEdgesState,
  useNodesState
} from "reactflow";
import "reactflow/dist/style.css";

import EditableBoxNode from "./EditableBoxNode";
import ProcessLinkNode from "./ProcessLinkNode";

type BoxData = {
  title?: string;
  text?: string;
  bg?: string;
  onChange?: (id: string, patch: Partial<BoxData>) => void;
};

type LinkData = {
  label?: string;
  targetProcessId?: number;
  options?: { id: number; name: string }[];
  onChange?: (id: string, patch: Partial<LinkData>) => void;
};

type RFNode = Node<any>;
type RFEdge = Edge;
type Diagram = { nodes: RFNode[]; edges: RFEdge[] };

function safeParseDiagram(diagram_json: string): Diagram {
  if (!diagram_json) return { nodes: [], edges: [] };
  try {
    const d = JSON.parse(diagram_json);
    if (!d.nodes || !d.edges) return { nodes: [], edges: [] };
    return d as Diagram;
  } catch {
    return { nodes: [], edges: [] };
  }
}

export default function DiagramEditor(props: { processId: number; initialDiagramJson: string }) {
  const initial = safeParseDiagram(props.initialDiagramJson);

  const [nodes, setNodes, onNodesChange] = useNodesState<any>(initial.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges || []);
  const [status, setStatus] = useState<string>("");
  const [options, setOptions] = useState<{ id: number; name: string }[]>([]);
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  useEffect(() => {
    fetch(`${base}/processes/options`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setOptions(d.map((x: any) => ({ id: x.id, name: x.name }))))
      .catch(() => setOptions([]));
  }, [base]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({ ...connection }, eds));
  }, [setEdges]);

  const onBoxChange = useCallback((id: string, patch: Partial<BoxData>) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n));
  }, [setNodes]);

  const onLinkChange = useCallback((id: string, patch: Partial<LinkData>) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n));
  }, [setNodes]);

  const nodeTypes = useMemo(() => ({
    box: EditableBoxNode,
    processLink: ProcessLinkNode
  }), []);

  const hydratedNodes: RFNode[] = useMemo(() => {
    return nodes.map((n) => {
      if (n.type === "processLink") {
        return {
          ...n,
          data: {
            ...n.data,
            options,
            onChange: onLinkChange
          }
        };
      }
      return {
        ...n,
        type: n.type || "box",
        data: {
          ...n.data,
          onChange: onBoxChange
        }
      };
    });
  }, [nodes, options, onBoxChange, onLinkChange]);

  const addBox = () => {
    const id = `n${Date.now()}`;
    setNodes((nds) => nds.concat({
      id,
      type: "box",
      position: { x: 420, y: 120 + nds.length * 40 },
      data: { title: "Task", text: "", bg: "" }
    }));
  };

  const addLink = () => {
    const id = `l${Date.now()}`;
    setNodes((nds) => nds.concat({
      id,
      type: "processLink",
      position: { x: 820, y: 120 + nds.length * 40 },
      data: { label: "Go to", targetProcessId: undefined }
    }));
  };

  const deleteSelected = () => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  };

  const save = async () => {
    setStatus("saving");
    const diagram = {
      nodes: nodes.map((n) => ({ ...n, data: { ...n.data, onChange: undefined, options: undefined } })),
      edges
    };

    const res = await fetch(`${base}/processes/${props.processId}/diagram`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diagram_json: JSON.stringify(diagram) })
    });

    if (!res.ok) {
      setStatus(`error: ${await res.text()}`);
      return;
    }
    setStatus("saved");
    setTimeout(() => setStatus(""), 1000);
  };

  return (
    <div style={{ height: 680, border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: 10, borderBottom: "1px solid #ddd", display: "flex", gap: 10 }}>
        <button onClick={addBox}>Add box</button>
        <button onClick={addLink}>Add process link</button>
        <button onClick={deleteSelected}>Delete selected</button>
        <button onClick={save}>Save</button>
        <div style={{ marginLeft: "auto", fontSize: 12 }}>{status}</div>
      </div>
      <div style={{ height: 630 }}>
        <ReactFlow
          nodes={hydratedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
