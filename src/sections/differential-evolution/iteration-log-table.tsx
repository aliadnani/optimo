import Math from '../../components/Math'
import type { IterationLogEntry } from './types'

type Props = {
    log: IterationLogEntry[]
    maxEntriesShown?: number
}

export default function IterationLogTable({ log, maxEntriesShown }: Props) {
    return (
        <table
            style={{
                marginTop: '2rem',
                marginLeft: 'auto',
                marginRight: 'auto',
                fontSize: '0.7em',
            }}
        >
            <thead>
                <tr>
                    <th style={{ textAlign: 'left', paddingRight: '1rem' }}>
                        <Math value="i" engine="asciimath" inline />
                    </th>
                    <th style={{ textAlign: 'left', paddingRight: '1rem' }}>
                        <Math value="f(x_i)" engine="asciimath" inline />
                    </th>
                    <th style={{ textAlign: 'left', paddingRight: '1rem' }}>
                        <Math value="x_i" engine="asciimath" inline />
                    </th>
                    <th style={{ textAlign: 'left', paddingRight: '1rem' }}>
                        <Math value="u_i" engine="asciimath" inline />
                    </th>
                    <th style={{ textAlign: 'left', paddingRight: '1rem' }}>
                        <Math value="f(u_i)" engine="asciimath" inline />
                    </th>
                    <th style={{ textAlign: 'left' }}>
                        <Math value="x_text{new}" engine="asciimath" inline />
                    </th>
                </tr>
            </thead>
            <tbody>
                {log.slice(0, maxEntriesShown).map((entry) => (
                    <tr key={entry.index}>
                        <td style={{ paddingRight: '1rem' }}>
                            {entry.index + 1}
                        </td>
                        <td style={{ paddingRight: '1rem' }}>
                            {entry.prevFitness.toFixed(4)}
                        </td>
                        <td style={{ paddingRight: '1rem' }}>
                            ({entry.prevX.toFixed(3)}, {entry.prevY.toFixed(3)})
                        </td>
                        <td style={{ paddingRight: '1rem' }}>
                            ({entry.trialX.toFixed(3)},{' '}
                            {entry.trialY.toFixed(3)})
                        </td>
                        <td style={{ paddingRight: '1rem' }}>
                            {entry.trialFitness.toFixed(4)}
                        </td>
                        <td>
                            ({entry.newX.toFixed(3)}, {entry.newY.toFixed(3)}){' '}
                            {entry.accepted ? '✓' : '✗'}
                        </td>
                    </tr>
                ))}
                {maxEntriesShown && log.length > maxEntriesShown ? (
                    <tr>
                        <td colSpan={6} style={{ textAlign: 'center' }}>
                            ...and {log.length - maxEntriesShown} more entries
                        </td>
                    </tr>
                ) : null}
            </tbody>
        </table>
    )
}
