import { type CustomMark } from '../../features/rossenbrock'
import type { IterationLogEntry, Point } from './types'

export function generateRandomPoints(
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    populationSize: number
): Point[] {
    return Array.from({ length: populationSize }, () => {
        const x = minX + Math.random() * (maxX - minX)
        const y = minY + Math.random() * (maxY - minY)
        const colorHex =
            '#' +
            Math.floor(Math.random() * 16777215)
                .toString(16)
                .padStart(6, '0')

        return { x, y, colorHex }
    })
}

export function generateMarks(
    points: Point[],
    prevPoints?: Point[] | null
): CustomMark[] {
    return points.map((point, i) => ({
        position: { x: point.x, y: point.y },
        oldPosition:
            // {x: point.x + 1, y: point.y + 1},
            prevPoints && prevPoints[i]
                ? { x: prevPoints[i].x, y: prevPoints[i].y }
                : null,
        mark: {
            fill: point.colorHex,
            // radius in pixels for Plot.dot
            r: 6,
            // keep a bold outline for visibility
            stroke: '#fff',
            strokeWidth: 1,
        },
    }))
}

export function randomIndexExcluding(
    excludeIndices: number[],
    arrayLength: number
): number {
    let randIndex: number
    do {
        randIndex = Math.floor(Math.random() * arrayLength)
    } while (excludeIndices.includes(randIndex))
    return randIndex
}

export function computeRosenbrock(
    x: number,
    y: number,
    a = 1,
    b = 100
): {
    value: number
    term1: number
    term2: number
    inner: number
    a: number
    b: number
} {
    const term1 = (a - x) ** 2
    const inner = y - x ** 2
    const term2 = b * inner ** 2
    return { value: term1 + term2, term1, term2, inner, a, b }
}

export function rosenbrock(x: number, y: number): number {
    //       const a = 20;
    //   const b = 0.2;
    //   const c = 2 * Math.PI;
    //   const d = 2; // Dimension for two variables

    //   const sumSqrs = x * x + y * y;
    //   const sumCos = Math.cos(c * x) + Math.cos(c * y);

    //   const term1 = -a * Math.exp(-b * Math.sqrt((1 / d) * sumSqrs));
    //   const term2 = -Math.exp((1 / d) * sumCos);
    //   const term3 = a + Math.exp(1);

    //   return term1 + term2 + term3;
    return computeRosenbrock(x, y).value
}

export function updatePopulation(
    points: Point[],
    F: number,
    CR: number
): { nextPoints: Point[]; log: IterationLogEntry[] } {
    const newPoints: Point[] = []
    const log: IterationLogEntry[] = []

    if (points.length < 4) {
        return { nextPoints: points.slice(), log }
    }

    for (let i = 0; i < points.length; i++) {
        const individual = points[i]

        // Ensure at least one dimension from mutation vector
        const jRand = Math.floor(Math.random() * 2) as 0 | 1 // 0 for x, 1 for y

        // Select three distinct random individuals (different from i and each other)
        const aIndex = randomIndexExcluding([i], points.length)
        const bIndex = randomIndexExcluding([i, aIndex], points.length)
        const cIndex = randomIndexExcluding([i, aIndex, bIndex], points.length)

        const a = points[aIndex]
        const b = points[bIndex]
        const c = points[cIndex]

        // Mutation: v = a + F * (b - c)
        const mutationVectorX = a.x + F * (b.x - c.x)
        const mutationVectorY = a.y + F * (b.y - c.y)

        // Crossover: create trial vector
        const trialVectorX = mutationVectorX
        // const trialVectorY = mutationVectorY
        Math.random() < CR || jRand === 0 ? mutationVectorX : individual.x
        const trialVectorY =
            Math.random() < CR || jRand === 1 ? mutationVectorY : individual.y
        const sourceX: 'v' | 'x' = trialVectorX === mutationVectorX ? 'v' : 'x'
        const sourceY: 'v' | 'x' = trialVectorY === mutationVectorY ? 'v' : 'x'

        // Selection: compare fitness
        const individualFitness = rosenbrock(individual.x, individual.y)
        const trialFitness = rosenbrock(trialVectorX, trialVectorY)

        const accepted = trialFitness < individualFitness
        const next = accepted
            ? { x: trialVectorX, y: trialVectorY }
            : { x: individual.x, y: individual.y }

        newPoints.push({ x: next.x, y: next.y, colorHex: individual.colorHex })

        log.push({
            index: i,
            prevX: individual.x,
            prevY: individual.y,
            prevFitness: individualFitness,
            aIndex,
            bIndex,
            cIndex,
            aX: a.x,
            aY: a.y,
            bX: b.x,
            bY: b.y,
            cX: c.x,
            cY: c.y,
            mutationX: mutationVectorX,
            mutationY: mutationVectorY,
            sourceX,
            sourceY,
            jRand,
            trialX: trialVectorX,
            trialY: trialVectorY,
            trialFitness,
            accepted,
            newX: next.x,
            newY: next.y,
        })
    }

    return { nextPoints: newPoints, log }
}
