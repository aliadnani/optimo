import * as Plot from '@observablehq/plot'
import * as d3 from 'd3'
import { useEffect, useRef } from 'react'

export type CustomMark = {
    position: { x: number; y: number }
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
}

function Rosenbrock({ customMarks = [] }: RosenbrockProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        // Rosenbrock Parameters
        const [a, b] = [1, 100]

        const rosenbrock = (x: number, y: number) =>
            (a - x) ** 2 + b * (y - x ** 2) ** 2

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
        const plot = Plot.plot({
            color: {
                type: 'log',
                scheme: 'viridis',
                // legend: true,
                base: 10,
                domain: [1e-4, 1e3], // Match Wikipedia: 10^-4 to 10^3
                label: 'f(x,y)',
            },
            aspectRatio: 1,
            width: 600,
            height: 600,
            marks: [
                Plot.contour({
                    fill: rosenbrock,
                    stroke: 'white',
                    strokeWidth: 0.5,
                    x1: -2,
                    x2: 2,
                    y1: -1,
                    y2: 3,
                    thresholds: logThresholds,
                }),
                // Render X marks and lines from customMarks configuration
                ...customMarks.flatMap((mark) => {
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
        d3.select(legend).style('margin', '0 auto').style('display', 'table')

        // React shenanigans
        containerRef.current?.append(plot)
        containerRef.current?.append(legend)
        return () => {
            plot.remove()
            legend.remove()
        }
    }, [customMarks])

    return (
        <>
            {/* <h2>Rosenbrock Function Visualization</h2> */}
            <div ref={containerRef} />
        </>
    )
}

export default Rosenbrock
