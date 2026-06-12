import type { ReactNode } from "react";
import { DocTable as DocTableStyles } from "../layout.arv";
import { renderProse } from "../../lib/render-prose";

function renderCell(cell: ReactNode) {
  return renderProse(cell);
}

export function DocTable(props: { headers: ReactNode[]; rows: ReactNode[][] }) {
  const t = DocTableStyles();
  return (
    <div className={t.root}>
      <table className={t.table}>
        <thead>
          <tr>
            {props.headers.map((header, hi) => (
              <th key={hi} className={t.th}>
                {renderCell(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className={t.td}>
                  {renderCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
