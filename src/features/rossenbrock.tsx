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
    mark?: {
        fill: string
        // radius in pixels for Plot.dot
        r?: number
        // optional stroke and width for dot outline
        stroke?: string
        strokeWidth?: number
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
    // Optional animation duration for dot transitions (ms)
    animationDurationMs?: number
}

// Keep a single source of truth for the plotting domain
const DOMAIN = {
    x1: -2,
    x2: 2,
    y1: -1,
    y2: 3,
}

function Rosenbrock({
    customMarks = [],
    aspect,
    animationDurationMs,
}: RosenbrockProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)

    const marks = customMarks

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
        // Plot-level clipping is enabled; no manual segment clipping required.

    const plot = Plot.plot({
            color: {
                type: 'log',
                scheme: 'viridis',
                // legend: true,
                base: 10,
                domain: [1e-4, 1e3], // Match Wikipedia: 10^-4 to 10^3
                label: 'f(x,y)',
            },
            x: { domain: [DOMAIN.x1, DOMAIN.x2] },
            y: { domain: [DOMAIN.y1, DOMAIN.y2] },
            aspectRatio: aspect ?? 0.56,
            // width: 600,
            // height: 600,
                clip: true,
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
                // Render X marks and lines from filtered configuration
                ...marks.flatMap((mark) => {
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
                                clip: true,
                            })
                        )
                    }

                    // If we have an old position, draw a line from old -> new, clipped to DOMAIN
                    if (
                        mark.oldPosition &&
                        Number.isFinite(mark.oldPosition.x) &&
                        Number.isFinite(mark.oldPosition.y)
                    ) {
                        const moveLink = [
                            {
                                x1: mark.oldPosition.x,
                                y1: mark.oldPosition.y,
                                x2: mark.position.x,
                                y2: mark.position.y,
                            },
                        ]
                        marks.push(
                            Plot.link(moveLink, {
                                x1: 'x1',
                                y1: 'y1',
                                x2: 'x2',
                                y2: 'y2',
                                stroke: mark.mark?.fill ?? '#333',
                                strokeWidth: 1.5,
                                strokeOpacity: 0.8,
                                className: 'de-lines',
                                clip: true,
                            })
                        )
                    }

                    // Add circular mark if configured (use Plot.dot)
                    if (mark.mark) {
                        marks.push(
                            Plot.dot(
                                [
                                    {
                                        x:
                                            mark.oldPosition?.x ??
                                            mark.position.x,
                                        y:
                                            mark.oldPosition?.y ??
                                            mark.position.y,
                                    },
                                ],
                                {
                                    x: 'x',
                                    y: 'y',
                                    fill: mark.mark.fill,
                                    r: mark.mark.r ?? 6,
                                    stroke: mark.mark.stroke,
                                    strokeWidth: mark.mark.strokeWidth,
                                    className: 'de-points',
                                    clip: true,

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
                                    clip: true,
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

        const xScale = plot.scale('x')
        const yScale = plot.scale('y')
        // Center the legend
        d3.select(plot).style('margin', '0 auto').style('display', 'table')

        animationDurationMs = animationDurationMs ?? 98

        d3.select(plot)
            .selectAll('.de-lines')
            .style('opacity', 0)
            .transition()
            .duration(Math.max(0, Math.floor(animationDurationMs * (2 / 5))))
            .ease(d3.easeQuadInOut)
            .style('opacity', 1)
            .transition()
            .delay(animationDurationMs * (1 / 5))
            .duration(Math.max(0, Math.floor(animationDurationMs * (2 / 5))))
            .style('opacity', 0)

        if (xScale && yScale && marks[0]?.oldPosition) {
            d3.select(plot)
                .selectAll('.de-points circle')
                .data(marks)
                .transition()
                .ease(d3.easeCubicInOut)
                .attr('cx', (d) => xScale.apply(d.position.x))
                .attr('cy', (d) => yScale.apply(d.position.y))
                .duration(Math.max(0, Math.floor(animationDurationMs)))
        }
        // transition().attr('r', 2).duration(95)
        d3.select(legend).style('margin', '0 auto').style('display', 'table')

        // React shenanigans
        containerRef.current?.append(plot)
        containerRef.current?.append(legend)

        return () => {
            plot.remove()
            legend.remove()
        }
    }, [marks, aspect, animationDurationMs])

    return (
        <>
            {/* <h2>Rosenbrock Function Visualization</h2> */}
            <div ref={containerRef} />
        </>
    )
}

export default Rosenbrock
