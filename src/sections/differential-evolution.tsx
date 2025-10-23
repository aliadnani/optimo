import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Rosenbrock, { type CustomMark } from '../features/rossenbrock'

type ParameterConfig = {
    min: number
    max: number
    symbol: string
    unit?: string
}

type FormValues = {
    populationSize: number
    crossoverProbability: number
    differentialWeight: number
    iterations: number
    intervalDuration: number
}

const POPULATION_SIZE_CONFIG: ParameterConfig = {
    min: 4,
    max: 12,
    symbol: 'NP',
}

const CROSSOVER_PROBABILITY_CONFIG: ParameterConfig = {
    min: 0,
    max: 1,
    symbol: 'CR',
}

const DIFFERENTIAL_WEIGHT_CONFIG: ParameterConfig = {
    min: 0,
    max: 2,
    symbol: 'F',
}

const ITERATIONS_CONFIG: ParameterConfig = {
    min: 1,
    max: 1000,
    symbol: 'i',
}

const INTERVAL_CONFIG: ParameterConfig = {
    min: 30,
    max: 1000,
    symbol: 'ms',
    unit: 'ms',
}

type Point = {
    colorHex: string
    x: number
    y: number
}

function generateRandomPoints(
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

function generateMarks(points: Point[]): CustomMark[] {
    return points.map((point) => ({
        position: { x: point.x, y: point.y },
        xMark: {
            symbol: '○',
            fill: point.colorHex,
            fontSize: 16,
            fontWeight: 'bold',
        },
    }))
}

function updatePoint(point: Point): Point {
    return {
        x: point.x + 0.02,
        y: point.y + 0.02,
        colorHex: point.colorHex,
    }
}

function DifferentialEvolution() {
    const [points, setPoints] = useState<Point[]>([])
    const [iteration, setIteration] = useState(0)
    // const [customMarks, setCustomMarks] = useState<CustomMark[]>([]);
    const [isRunning, setIsRunning] = useState(true)

    const {
        register,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            populationSize: 6,
            crossoverProbability: 0.9,
            differentialWeight: 0.8,
            iterations: 100,
            intervalDuration: 100,
        },
        mode: 'onChange',
    })

    const populationSize = watch('populationSize')
    const intervalDuration = watch('intervalDuration')

    const getConstraintText = (config: ParameterConfig) => {
        return `${config.min} ≤ ${config.symbol} ≤ ${config.max}`
    }

    useEffect(() => {
        // Generate initial marks
        const points = generateRandomPoints(
            -1.8,
            1.8,
            -0.8,
            2.8,
            populationSize
        )
        setPoints(points)
        // setCustomMarks(generateMarks(points));

        // Update marks every interval duration only if running
        if (!isRunning) return

        const interval = setInterval(() => {
            const updatedPoints = points.map((point) => updatePoint(point))
            setPoints(updatedPoints)

            if (iteration < watch('iterations')) {
                setIteration((prev) => prev + 1)
            } else {
                setIteration(0)
            }
        }, intervalDuration)

        return () => clearInterval(interval)
    }, [isRunning, populationSize, intervalDuration])

    return (
        <article>
            <h2>Differential Evolution</h2>
            <p>
                Differential Evolution (DE) is a population-based optimization
                algorithm used for solving complex optimization problems. It is
                particularly effective for continuous, non-linear, and
                multi-modal functions. DE operates through the mechanisms of
                mutation, crossover, and selection to evolve a population of
                candidate solutions towards an optimal solution.
            </p>
            <div style={{ marginBottom: '1rem' }}>
                <button onClick={() => setIsRunning(!isRunning)}>
                    {isRunning ? 'Stop' : 'Start'}
                </button>
            </div>
            <table style={{ marginBottom: '1rem' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', paddingRight: '1rem' }}>
                            Parameter
                        </th>
                        <th style={{ textAlign: 'left', paddingRight: '1rem' }}>
                            Value
                        </th>
                        <th style={{ textAlign: 'left' }}>Constraints</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td
                            style={{ fontWeight: 'bold', paddingRight: '1rem' }}
                        >
                            Population Size (NP)
                        </td>
                        <td style={{ paddingRight: '1rem' }}>
                            <input
                                type="number"
                                {...register('populationSize', {
                                    min: POPULATION_SIZE_CONFIG.min,
                                    max: POPULATION_SIZE_CONFIG.max,
                                    valueAsNumber: true,
                                })}
                                style={{ width: '60px' }}
                            />
                        </td>
                        <td>
                            <span
                                style={{
                                    color: errors.populationSize
                                        ? 'red'
                                        : 'black',
                                    fontStyle: 'italic',
                                    fontSize: '0.9em',
                                }}
                            >
                                {getConstraintText(POPULATION_SIZE_CONFIG)}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td
                            style={{ fontWeight: 'bold', paddingRight: '1rem' }}
                        >
                            Crossover Probability (CR)
                        </td>
                        <td style={{ paddingRight: '1rem' }}>
                            <input
                                type="number"
                                step="0.1"
                                {...register('crossoverProbability', {
                                    min: CROSSOVER_PROBABILITY_CONFIG.min,
                                    max: CROSSOVER_PROBABILITY_CONFIG.max,
                                    valueAsNumber: true,
                                })}
                                style={{ width: '60px' }}
                            />
                        </td>
                        <td>
                            <span
                                style={{
                                    color: errors.crossoverProbability
                                        ? 'red'
                                        : 'black',
                                    fontStyle: 'italic',
                                    fontSize: '0.9em',
                                }}
                            >
                                {getConstraintText(
                                    CROSSOVER_PROBABILITY_CONFIG
                                )}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td
                            style={{ fontWeight: 'bold', paddingRight: '1rem' }}
                        >
                            Differential Weight (F)
                        </td>
                        <td style={{ paddingRight: '1rem' }}>
                            <input
                                type="number"
                                step="0.1"
                                {...register('differentialWeight', {
                                    min: DIFFERENTIAL_WEIGHT_CONFIG.min,
                                    max: DIFFERENTIAL_WEIGHT_CONFIG.max,
                                    valueAsNumber: true,
                                })}
                                style={{ width: '60px' }}
                            />
                        </td>
                        <td>
                            <span
                                style={{
                                    color: errors.differentialWeight
                                        ? 'red'
                                        : 'black',
                                    fontStyle: 'italic',
                                    fontSize: '0.9em',
                                }}
                            >
                                {getConstraintText(DIFFERENTIAL_WEIGHT_CONFIG)}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td
                            style={{ fontWeight: 'bold', paddingRight: '1rem' }}
                        >
                            Iterations (i)
                        </td>
                        <td style={{ paddingRight: '1rem' }}>
                            <input
                                type="number"
                                {...register('iterations', {
                                    min: ITERATIONS_CONFIG.min,
                                    max: ITERATIONS_CONFIG.max,
                                    valueAsNumber: true,
                                })}
                                style={{ width: '60px' }}
                            />
                        </td>
                        <td>
                            <span
                                style={{
                                    color: errors.iterations ? 'red' : 'black',
                                    fontStyle: 'italic',
                                    fontSize: '0.9em',
                                }}
                            >
                                {getConstraintText(ITERATIONS_CONFIG)}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td
                            style={{ fontWeight: 'bold', paddingRight: '1rem' }}
                        >
                            Refresh Interval (ms):
                        </td>
                        <td style={{ paddingRight: '1rem' }}>
                            <input
                                type="number"
                                {...register('intervalDuration', {
                                    min: INTERVAL_CONFIG.min,
                                    max: INTERVAL_CONFIG.max,
                                    valueAsNumber: true,
                                })}
                                style={{ width: '60px' }}
                            />
                        </td>
                        <td>
                            <span
                                style={{
                                    color: errors.intervalDuration
                                        ? 'red'
                                        : 'black',
                                    fontStyle: 'italic',
                                    fontSize: '0.9em',
                                }}
                            >
                                {getConstraintText(INTERVAL_CONFIG)}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <Rosenbrock customMarks={generateMarks(points)} />
        </article>
    )
}

export default DifferentialEvolution
