import * as Plot from '@observablehq/plot'
import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import { rosenbrock } from '../sections/differential-evolution/utils'

export type CustomMark = {
    position: { x: number; y: number }
    oldPosition?: { x: number; y: number } | null
    line?: {
        length: number
        angle: number
        stroke: string
        strokeWidth: number
    } | null
    xMark?: {
        symbol: string
        fill: string
        fontSize: number
        fontWeight: 'normal' | 'bold' | 'lighter' | 'bolder' | number
    } | null
    label?: {
        text: string
        dy?: number
        dx?: number
        fill: string
        fontSize: number
        fontWeight: 'normal' | 'bold' | 'lighter' | 'bolder' | number
    } | null
}

type RosenbrockProps = {
    customMarks?: CustomMark[]
    aspect?: number
}

// Keep a single source of truth for the plotting domain
const DOMAIN = {
    x1: -2,
    x2: 2,
    y1: -1,
    y2: 3,
}

function Rosenbrock({ customMarks = [], aspect }: RosenbrockProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        // Generate logarithmically spaced thresholds
        // Log threshold configuration
        const LOG_MIN_EXPONENT = -4 // 10^-4
        const LOG_MAX_EXPONENT = 3 // 10^3
        const LOG_STEP = 0.8 // Step size in log space

        const logThresholds = []
        for (let i = LOG_MIN_EXPONENT; i <= LOG_MAX_EXPONENT; i += LOG_STEP) {
            logThresholds.push(10 ** i)
        }

        // Main plotting code here !!
        // Helper: clip a line segment to the DOMAIN rectangle using Liang–Barsky
        function clipSegmentToDomain(
            x0: number,
            y0: number,
            x1: number,
            y1: number
        ): { x1: number; y1: number; x2: number; y2: number } | null {
            const xmin = DOMAIN.x1
            const xmax = DOMAIN.x2
            const ymin = DOMAIN.y1
            const ymax = DOMAIN.y2

            const dx = x1 - x0
            const dy = y1 - y0

            let u1 = 0
            let u2 = 1

            const p = [-dx, dx, -dy, dy]
            const q = [x0 - xmin, xmax - x0, y0 - ymin, ymax - y0]

            for (let i = 0; i < 4; i++) {
                const pi = p[i]
                const qi = q[i]
                if (pi === 0) {
                    if (qi < 0) return null // Parallel and outside
                } else {
                    const r = qi / pi
                    if (pi < 0) {
                        if (r > u2) return null
                        if (r > u1) u1 = r
                    } else if (pi > 0) {
                        if (r < u1) return null
                        if (r < u2) u2 = r
                    }
                }
            }

            const cx0 = x0 + u1 * dx
            const cy0 = y0 + u1 * dy
            const cx1 = x0 + u2 * dx
            const cy1 = y0 + u2 * dy
            return { x1: cx0, y1: cy0, x2: cx1, y2: cy1 }
        }

        // Filter out marks outside the plotting domain
        const filteredMarks = customMarks.filter((m) => {
            const x = m.position.x
            const y = m.position.y
            return (
                Number.isFinite(x) &&
                Number.isFinite(y) &&
                x >= DOMAIN.x1 &&
                x <= DOMAIN.x2 &&
                y >= DOMAIN.y1 &&
                y <= DOMAIN.y2
            )
        })

        const plot = Plot.plot({
            color: {
                type: 'log',
                scheme: 'viridis',
                // legend: true,
                base: 10,
                domain: [1e-4, 1e3], // Match Wikipedia: 10^-4 to 10^3
                label: 'f(x,y)',
            },
            aspectRatio: aspect ?? 0.56,
            // width: 600,
            // height: 600,
            marks: [
                Plot.contour({
                    fill: rosenbrock,
                    stroke: 'white',
                    strokeWidth: 0.5,
                    x1: DOMAIN.x1,
                    x2: DOMAIN.x2,
                    y1: DOMAIN.y1,
                    y2: DOMAIN.y2,
                    thresholds: logThresholds,
                }),
                // Render X marks and lines from customMarks configuration
                ...filteredMarks.flatMap((mark) => {
                    const marks = []

                    // Add line if configured
                    if (mark.line) {
                        const lineData = [
                            {
                                x1: mark.position.x,
                                y1: mark.position.y,
                                x2:
                                    mark.position.x +
                                    mark.line.length *
                                        Math.cos(mark.line.angle),
                                y2:
                                    mark.position.y +
                                    mark.line.length *
                                        Math.sin(mark.line.angle),
                            },
                        ]

                        marks.push(
                            Plot.link(lineData, {
                                x1: 'x1',
                                y1: 'y1',
                                x2: 'x2',
                                y2: 'y2',
                                stroke: mark.line.stroke,
                                strokeWidth: mark.line.strokeWidth,
                            })
                        )
                    }

                    // If we have an old position, draw a line from old -> new, clipped to DOMAIN
                    if (
                        mark.oldPosition &&
                        Number.isFinite(mark.oldPosition.x) &&
                        Number.isFinite(mark.oldPosition.y)
                    ) {
                        const clipped = clipSegmentToDomain(
                            mark.oldPosition.x,
                            mark.oldPosition.y,
                            mark.position.x,
                            mark.position.y
                        )

                        if (clipped) {
                            const moveLink = [clipped]
                            marks.push(
                                Plot.link(moveLink, {
                                    x1: 'x1',
                                    y1: 'y1',
                                    x2: 'x2',
                                    y2: 'y2',
                                    stroke: mark.xMark?.fill ?? '#333',
                                    strokeWidth: 1.5,
                                    strokeOpacity: 0.8,
                                })
                            )
                        }
                    }

                    // Add X marker if configured
                    if (mark.xMark) {
                        marks.push(
                            Plot.text(
                                [
                                    {
                                        x: mark.position.x,
                                        y: mark.position.y,
                                        label: mark.xMark.symbol,
                                    },
                                ],
                                {
                                    x: 'x',
                                    y: 'y',
                                    text: 'label',
                                    fill: mark.xMark.fill,
                                    fontSize: mark.xMark.fontSize,
                                    fontWeight: mark.xMark.fontWeight,
                                }
                            )
                        )
                    }

                    // Add label if configured
                    if (mark.label) {
                        marks.push(
                            Plot.text(
                                [
                                    {
                                        x: mark.position.x,
                                        y: mark.position.y,
                                        label: mark.label.text,
                                    },
                                ],
                                {
                                    x: 'x',
                                    y: 'y',
                                    text: 'label',
                                    dy: mark.label.dy,
                                    dx: mark.label.dx,
                                    fill: mark.label.fill,
                                    fontSize: mark.label.fontSize,
                                    fontWeight: mark.label.fontWeight,
                                    paintOrder: 'stroke',
                                }
                            )
                        )
                    }

                    return marks
                }),
            ],
        })

        // Create a separate legend
        const legend = Plot.legend({
            color: {
                type: 'log',
                scheme: 'viridis',
                base: 10,
                domain: [1e-4, 1e3],
                label: 'f(x,y)',
            },
        })

        // Center the legend
        d3.select(plot).style('margin', '0 auto').style('display', 'table')
        d3.select(legend).style('margin', '0 auto').style('display', 'table')

        // React shenanigans
        containerRef.current?.append(plot)
        containerRef.current?.append(legend)

        return () => {
            plot.remove()
            legend.remove()
        }
    }, [customMarks, aspect])

    return (
        <>
            {/* <h2>Rosenbrock Function Visualization</h2> */}
            <div ref={containerRef} />
        </>
    )
}

export default Rosenbrock
