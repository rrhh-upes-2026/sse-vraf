"use client";

import type { BlueprintDependencyGraph, DependencyNode, DependencyNodeType } from "@/types/studio";

const CANVAS_W = 580;
const BP_X = 16;
const BP_W = 180;
const BP_H = 72;
const LINE_FROM_X = BP_X + BP_W;
const DEP_X = 300;
const DEP_W = 240;
const SECTION_GAP = 18;
const HEADER_H = 26;
const ITEM_H = 30;
const ITEM_GAP = 5;
const PAD_TOP = 16;
const PAD_BOTTOM = 16;

type DepType = Exclude<DependencyNodeType, "blueprint">;

const TYPE_COLOR: Record<DepType, string> = {
  form:       "#2E6BE6",
  indicator:  "#0F8A8A",
  report:     "#12A150",
  permission: "#E5A100",
};

const TYPE_LABEL: Record<DepType, string> = {
  form:       "FORMULARIOS",
  indicator:  "INDICADORES",
  report:     "REPORTES",
  permission: "PERMISOS",
};

const GROUP_ORDER: DepType[] = ["form", "indicator", "report", "permission"];

interface ItemLayout {
  node: DependencyNode;
  y: number;
  cy: number;
}

interface GroupLayout {
  type: DepType;
  color: string;
  label: string;
  y: number;
  items: ItemLayout[];
}

interface DependencyGraphProps {
  graph: BlueprintDependencyGraph;
  allBlueprintNames?: Record<string, string>;
}

function trunc(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export function DependencyGraph({ graph, allBlueprintNames }: DependencyGraphProps) {
  const depNodes = graph.nodes.filter(n => n.type !== "blueprint");

  if (depNodes.length === 0) {
    const emptyH = 120;
    return (
      <svg width="100%" viewBox={`0 0 ${CANVAS_W} ${emptyH}`}>
        <g transform={`translate(${CANVAS_W / 2}, ${emptyH / 2})`}>
          <circle cx={0} cy={-18} r={14} fill="#DCFCE7" stroke="#12A150" strokeWidth={1.5} />
          <path
            d="M -6 -18 L -2 -14 L 6 -22"
            stroke="#12A150"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <text
            x={0}
            y={8}
            textAnchor="middle"
            fontSize={13}
            fill="#6B7280"
            fontFamily="system-ui, sans-serif"
          >
            Sin dependencias externas
          </text>
        </g>
      </svg>
    );
  }

  const grouped = GROUP_ORDER.reduce<Record<DepType, DependencyNode[]>>(
    (acc, type) => {
      acc[type] = depNodes.filter(n => n.type === type);
      return acc;
    },
    { form: [], indicator: [], report: [], permission: [] },
  );

  let currentY = PAD_TOP;
  const groupLayouts: GroupLayout[] = [];

  for (const type of GROUP_ORDER) {
    const nodes = grouped[type];
    if (nodes.length === 0) continue;

    const groupY = currentY;
    const items: ItemLayout[] = nodes.map((node, i) => {
      const y = groupY + HEADER_H + i * (ITEM_H + ITEM_GAP);
      return { node, y, cy: y + ITEM_H / 2 };
    });

    groupLayouts.push({ type, color: TYPE_COLOR[type], label: TYPE_LABEL[type], y: groupY, items });

    currentY += HEADER_H + nodes.length * (ITEM_H + ITEM_GAP) + SECTION_GAP;
  }

  const totalAccumulated = currentY - PAD_TOP;
  const totalDepHeight = totalAccumulated - SECTION_GAP;
  const svgH = PAD_TOP + totalDepHeight + PAD_BOTTOM;

  const bpY = Math.max(PAD_TOP, PAD_TOP + totalDepHeight / 2 - BP_H / 2);
  const bpCY = bpY + BP_H / 2;

  const cpX = (LINE_FROM_X + DEP_X) / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${CANVAS_W} ${svgH}`}>
      {groupLayouts.map(group =>
        group.items.map(item => (
          <path
            key={`line-${item.node.id}`}
            d={`M ${LINE_FROM_X} ${bpCY} C ${cpX} ${bpCY} ${cpX} ${item.cy} ${DEP_X} ${item.cy}`}
            fill="none"
            stroke={group.color}
            strokeOpacity={0.5}
            strokeWidth={1}
          />
        ))
      )}

      <rect
        x={BP_X}
        y={bpY}
        width={BP_W}
        height={BP_H}
        rx={8}
        fill="#EAF1FE"
        stroke="#2E6BE6"
        strokeWidth={1.5}
      />
      <text
        x={BP_X + 10}
        y={bpY + 14}
        fontSize={8}
        fontWeight={700}
        fill="#2E6BE6"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.05em"
      >
        BLUEPRINT
      </text>
      <text
        x={BP_X + 10}
        y={bpY + 32}
        fontSize={12}
        fontWeight={600}
        fill="#1E3A8A"
        fontFamily="system-ui, sans-serif"
      >
        {trunc(graph.blueprintName, 22)}
      </text>
      <text
        x={BP_X + 10}
        y={bpY + 50}
        fontSize={10}
        fill="#6B7280"
        fontFamily="ui-monospace, monospace"
      >
        {trunc(graph.blueprintId, 24)}
      </text>

      {groupLayouts.map(group => (
        <g key={group.type}>
          <rect
            x={DEP_X}
            y={group.y}
            width={DEP_W}
            height={HEADER_H}
            rx={4}
            fill={group.color + "18"}
          />
          <text
            x={DEP_X + 8}
            y={group.y + HEADER_H / 2 + 4}
            fontSize={9}
            fontWeight={700}
            fill={group.color}
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.06em"
          >
            {group.label}
          </text>

          {group.items.map(item => (
            <g key={item.node.id}>
              <rect
                x={DEP_X}
                y={item.y}
                width={DEP_W}
                height={ITEM_H}
                rx={4}
                fill={item.node.broken ? "#FEF2F2" : "#FFFFFF"}
                stroke={item.node.broken ? "#FECACA" : "#E2E8F0"}
              />
              {item.node.broken && (
                <text
                  x={DEP_X + 8}
                  y={item.cy + 4}
                  fontSize={12}
                  fill="#EF4444"
                  fontFamily="system-ui, sans-serif"
                >
                  &#x26A0;
                </text>
              )}
              <text
                x={item.node.broken ? DEP_X + 24 : DEP_X + 8}
                y={item.cy + 4}
                fontSize={11}
                fill={item.node.broken ? "#DC2626" : "#374151"}
                fontFamily="ui-monospace, monospace"
                textDecoration={item.node.broken ? "line-through" : undefined}
              >
                {trunc(item.node.id, 28)}
              </text>
              {item.node.sharedWith && item.node.sharedWith.length > 0 && (
                <g>
                  <title>
                    {`Compartido con: ${item.node.sharedWith
                      .map(id => allBlueprintNames?.[id] ?? id)
                      .join(", ")}`}
                  </title>
                  <circle cx={DEP_X + DEP_W - 12} cy={item.cy} r={5} fill="#2E6BE6" />
                </g>
              )}
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
