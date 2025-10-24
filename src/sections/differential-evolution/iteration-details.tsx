import { computeRosenbrock } from './utils'
import type { IterationLogEntry, Point } from './types'

type Props = {
    iteration: number
    points: Point[]
    log: IterationLogEntry[]
    F: number
    CR: number
}

export default function IterationDetails({
    iteration,
    points,
    log,
    F,
    CR,
}: Props) {
    const hasData = points.length > 0 && log.length > 0

    if (!hasData) {
        return (
            <div style={{ lineHeight: 1.5 }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Iteration details</h3>
                <div style={{ marginBottom: '0.75rem' }}>
                    Current iteration: <strong>{iteration}</strong>
                </div>
                <div style={{ opacity: 0.8 }}>
                    Run a few iterations to see detailed calculations here.
                </div>
            </div>
        )
    }

    // Find best current individual (after selection) — compact reduce
    const { idx: bestIdx, fit: bestFit } = points.reduce(
        (acc, p, i) => {
            const f = computeRosenbrock(p.x, p.y).value
            return f < acc.fit ? { idx: i, fit: f } : acc
        },
        { idx: 0, fit: computeRosenbrock(points[0].x, points[0].y).value }
    )

    const bestP = points[bestIdx]
    const entry = log.find((e) => e.index === bestIdx)

    const x = bestP.x,
        y = bestP.y

    return (
        <div style={{ lineHeight: 1.5, fontSize: '0.6em' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Iteration details</h3>
            <div style={{ marginBottom: '0.75rem' }}>
                Current iteration: <strong>{iteration}</strong>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
                <strong>Best individual:</strong> i = {bestIdx + 1}, x = (
                {x.toFixed(6)}, {y.toFixed(6)}), f(x) = {bestFit.toFixed(6)}
            </div>
            <div
                style={{
                    fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: '0.95em',
                    whiteSpace: 'pre-wrap',
                    background: '#f7f7f7',
                    padding: '0.75rem',
                    borderRadius: 6,
                }}
            >
                {`Fitness f(x,y) = (1 - x)^2 + 100 * (y - x^2)^2
f(${x.toFixed(6)}, ${y.toFixed(6)}) = (1 - ${x.toFixed(6)})^2 + 100 * (${y.toFixed(6)} - ${x.toFixed(6)}^2)^2 = ${bestFit.toFixed(6)}`}
            </div>
            {entry ? (
                <div style={{ marginTop: '1rem' }}>
                    <div style={{ marginBottom: '0.25rem' }}>
                        <strong>Trial vector for i = {bestIdx + 1}</strong> (F ={' '}
                        {F}, CR = {CR})
                    </div>
                    <div
                        style={{
                            fontFamily:
                                'ui-monospace, SFMono-Regular, Menlo, monospace',
                            fontSize: '0.95em',
                            whiteSpace: 'pre-wrap',
                            background: '#f7f7f7',
                            padding: '0.75rem',
                            borderRadius: 6,
                        }}
                    >
                        {`Parents:
  a = (${entry.aX.toFixed(6)}, ${entry.aY.toFixed(6)})
  b = (${entry.bX.toFixed(6)}, ${entry.bY.toFixed(6)})
  c = (${entry.cX.toFixed(6)}, ${entry.cY.toFixed(6)})

Mutation (v = a + F * (b - c)):
  v_x = ${entry.aX.toFixed(6)} + ${F.toFixed(3)} * (${entry.bX.toFixed(6)} - ${entry.cX.toFixed(6)}) = ${entry.mutationX.toFixed(6)}
  v_y = ${entry.aY.toFixed(6)} + ${F.toFixed(3)} * (${entry.bY.toFixed(6)} - ${entry.cY.toFixed(6)}) = ${entry.mutationY.toFixed(6)}

Binomial crossover (j_rand = ${entry.jRand}):
  u_x = ${entry.sourceX === 'v' ? 'v_x' : 'x_i'} = ${entry.trialX.toFixed(6)}
  u_y = ${entry.sourceY === 'v' ? 'v_y' : 'x_i'} = ${entry.trialY.toFixed(6)}
`}
                    </div>
                    <div
                        style={{
                            marginTop: '0.5rem',
                            fontFamily:
                                'ui-monospace, SFMono-Regular, Menlo, monospace',
                            fontSize: '0.95em',
                            whiteSpace: 'pre-wrap',
                            background: '#f7f7f7',
                            padding: '0.75rem',
                            borderRadius: 6,
                        }}
                    >
                        {`Trial fitness f(u):
  f(${entry.trialX.toFixed(6)}, ${entry.trialY.toFixed(6)}) = (1 - ${entry.trialX.toFixed(6)})^2 + 100 * (${entry.trialY.toFixed(6)} - ${entry.trialX.toFixed(6)}^2)^2 = ${entry.trialFitness.toFixed(6)}
Accepted: ${entry.accepted ? 'yes' : 'no'} (new x = (${entry.newX.toFixed(6)}, ${entry.newY.toFixed(6)}))`}
                    </div>
                </div>
            ) : (
                <div style={{ opacity: 0.8 }}>
                    No trial info available for the best individual yet.
                </div>
            )}
        </div>
    )
}
