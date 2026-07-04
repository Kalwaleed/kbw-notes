import type { CSSProperties } from 'react'

export interface ColumnDef {
  key: string
  label: string
  type?: 'text' | 'number' | 'select'
  options?: { value: string; label: string }[]
  width?: string
  min?: number
  max?: number
}

interface RowsTableProps<Row extends Record<string, string>> {
  columns: ColumnDef[]
  rows: Row[]
  onChange: (rows: Row[]) => void
  /** Fixed-category tables (section 2) can't add/remove rows. */
  fixedRows?: boolean
  /** Renders the first column as a read-only label (fixed categories). */
  readOnlyFirstColumn?: boolean
  addLabel?: string
}

const cellInput: CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-mono-sm)',
  color: 'var(--color-ink)',
  background: 'var(--color-paper)',
  border: '1px solid var(--color-hair)',
  borderRadius: 3,
  boxSizing: 'border-box',
}

/** Repeatable-row table used by every list section of the self-report form. */
export function RowsTable<Row extends Record<string, string>>({
  columns,
  rows,
  onChange,
  fixedRows = false,
  readOnlyFirstColumn = false,
  addLabel = '+ Add row',
}: RowsTableProps<Row>) {
  const setCell = (rowIndex: number, key: string, value: string) => {
    onChange(rows.map((row, i) => (i === rowIndex ? { ...row, [key]: value } : row)))
  }

  const emptyRow = () =>
    Object.fromEntries(columns.map((c) => [c.key, ''])) as Row

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="font-mono uppercase"
                style={{
                  textAlign: 'left',
                  padding: '6px 8px',
                  fontSize: 'var(--text-mono-xs)',
                  letterSpacing: '0.05em',
                  color: 'var(--color-ink-muted)',
                  borderBottom: '1px solid var(--color-hair)',
                  width: col.width,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.label}
              </th>
            ))}
            {!fixedRows && <th style={{ width: 32 }} />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={col.key} style={{ padding: '4px 4px' }}>
                  {readOnlyFirstColumn && colIndex === 0 ? (
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 15,
                        whiteSpace: 'nowrap',
                        color: 'var(--color-ink)',
                      }}
                    >
                      {row[col.key]}
                    </span>
                  ) : col.type === 'select' ? (
                    <select
                      value={row[col.key] ?? ''}
                      onChange={(e) => setCell(rowIndex, col.key, e.target.value)}
                      aria-label={`${col.label} row ${rowIndex + 1}`}
                      style={cellInput}
                    >
                      <option value="">—</option>
                      {(col.options ?? []).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={col.type ?? 'text'}
                      min={col.min}
                      max={col.max}
                      value={row[col.key] ?? ''}
                      onChange={(e) => setCell(rowIndex, col.key, e.target.value)}
                      aria-label={`${col.label} row ${rowIndex + 1}`}
                      style={cellInput}
                    />
                  )}
                </td>
              ))}
              {!fixedRows && (
                <td style={{ padding: '4px 0', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => onChange(rows.filter((_, i) => i !== rowIndex))}
                    disabled={rows.length <= 1}
                    aria-label={`Remove row ${rowIndex + 1}`}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-ink-muted)',
                      cursor: rows.length <= 1 ? 'not-allowed' : 'pointer',
                      opacity: rows.length <= 1 ? 0.3 : 1,
                      fontSize: 16,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!fixedRows && (
        <button
          type="button"
          onClick={() => onChange([...rows, emptyRow()])}
          className="font-mono uppercase"
          style={{
            marginTop: 8,
            padding: '6px 10px',
            fontSize: 'var(--text-mono-xs)',
            letterSpacing: '0.05em',
            color: 'var(--color-accent)',
            background: 'transparent',
            border: '1px dashed var(--color-hair)',
            borderRadius: 3,
            cursor: 'pointer',
          }}
        >
          {addLabel}
        </button>
      )}
    </div>
  )
}
