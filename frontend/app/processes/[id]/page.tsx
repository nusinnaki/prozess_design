import ProcessView from "../../components/ProcessView";

type Process = {
  id: number;
  name: string;
  trigger: string;
  outcome: string;
  diagram_json: string;
};

async function apiGet<T>(path: string): Promise<T> {
  const base = process.env.INTERNAL_API_BASE || "http://backend:8000";
  const res = await fetch(`${base}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default async function ProcessDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const full: any = await apiGet<any>(`/processes/${id}`);

  const p: Process = {
    id: full.id,
    name: full.name,
    trigger: full.trigger || "",
    outcome: full.outcome || "",
    diagram_json: full.diagram_json || ""
  };

  return (
    <div>
      <h1>{p.name}</h1>
      <div style={{ marginBottom: 10 }}><b>Trigger:</b> {p.trigger}</div>
      <div style={{ marginBottom: 10 }}><b>Outcome:</b> {p.outcome}</div>

      <ProcessView p={p} />
    </div>
  );
}
