import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import Rosenbrock from '../../features/rossenbrock'
import Math from '../../components/Math'
import ParametersTable from './parameters-table'
import IterationLogTable from './iteration-log-table'
import { generateMarks, generateRandomPoints, updatePopulation } from './utils'
import type {
    FormValues,
    ParameterConfig,
    Point,
    IterationLogEntry,
} from './types'
import IterationDetails from './iteration-details'

const POPULATION_SIZE_CONFIG: ParameterConfig = {
    min: 4,
    max: 36,
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
const ITERATIONS_CONFIG: ParameterConfig = { min: 1, max: 1000, symbol: 'i' }
const INTERVAL_CONFIG: ParameterConfig = {
    min: 30,
    max: 1000,
    symbol: 'ms',
    unit: 'ms',
}

export default function DifferentialEvolution() {
    const [points, setPoints] = useState<Point[]>([])
    const [prevPoints, setPrevPoints] = useState<Point[] | null>(null)
    const [iteration, setIteration] = useState(0)
    const [isRunning, setIsRunning] = useState(true)
    const [iterationLog, setIterationLog] = useState<IterationLogEntry[]>([])
    const [hoveredButton, setHoveredButton] = useState<string | null>(null)
    const [isColumnLayout, setIsColumnLayout] = useState(false)

    const {
        register,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            populationSize: 10,
            crossoverProbability: 0.9,
            differentialWeight: 0.8,
            iterations: 68,
            intervalDuration: 100,
        },
        mode: 'onChange',
    })

    const populationSize = watch('populationSize')
    const intervalDuration = watch('intervalDuration')
    const F = watch('differentialWeight')
    const CR = watch('crossoverProbability')

    const configs = useMemo(
        () => ({
            population: POPULATION_SIZE_CONFIG,
            crossover: CROSSOVER_PROBABILITY_CONFIG,
            differentialWeight: DIFFERENTIAL_WEIGHT_CONFIG,
            iterations: ITERATIONS_CONFIG,
            interval: INTERVAL_CONFIG,
        }),
        []
    )

    // Keep responsive logic centralized here; matches CSS breakpoint at 900px
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return
        const mq = window.matchMedia('(max-width: 900px)')
        const handler = (e: MediaQueryListEvent | MediaQueryList) =>
            setIsColumnLayout(
                'matches' in e ? e.matches : (e as MediaQueryList).matches
            )
        // initialize and subscribe
        setIsColumnLayout(mq.matches)
        if (mq.addEventListener) {
            mq.addEventListener(
                'change',
                handler as (e: MediaQueryListEvent) => void
            )
        } else if ((mq as any).addListener) {
            ;(mq as any).addListener(handler)
        }
        return () => {
            if (mq.removeEventListener) {
                mq.removeEventListener(
                    'change',
                    handler as (e: MediaQueryListEvent) => void
                )
            } else if ((mq as any).removeListener) {
                ;(mq as any).removeListener(handler)
            }
        }
    }, [])

    useEffect(() => {
        const newPoints = generateRandomPoints(
            -1.8,
            1.8,
            -0.8,
            2.8,
            populationSize
        )
        setPoints(newPoints)
        setPrevPoints(null)
        setIteration(0)
        setIterationLog([])
    }, [populationSize])

    useEffect(() => {
        if (!isRunning) return

        const interval = setInterval(() => {
            const maxIterations = watch('iterations')
            const newIteration = iteration >= maxIterations ? 0 : iteration + 1
            setIteration(newIteration)

            if (newIteration === 0) {
                setPoints(
                    generateRandomPoints(-1.8, 1.8, -0.8, 2.8, populationSize)
                )
                setPrevPoints(null)
                setIterationLog([])
            } else {
                const result = updatePopulation(points, F, CR)
                setPrevPoints(points)
                setPoints(result.nextPoints)
                setIterationLog(result.log)
            }
        }, intervalDuration)

        return () => clearInterval(interval)
    }, [
        isRunning,
        intervalDuration,
        populationSize,
        iteration,
        points,
        watch,
        F,
        CR,
    ])

    // Math typesetting handled by <Math /> component

    return (
        <article>
            <h2>Differential Evolution</h2>
            <p>
                Differential Evolution (DE) is a population-based optimization
                algorithm that evolves a population of candidate solutions via
                mutation, crossover, and greedy selection.
            </p>
            <p>
                The{' '}
                <a
                    href="https://en.wikipedia.org/wiki/Differential_evolution#Algorithm"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Wikipedia article
                </a>
                {' '}explains the algorithm quite well.
            </p>

            <h3>Interactive Visualization</h3>

            <p>
                This section provides an interactive visualization of the
                differential evolution process. Set the parameters below to see
                how the algorithm evolves the population over time. Start, stop,
                and step through the iterations to observe the changes. There is
                also a summary of the results at the end as well as the
                calculation details.
            </p>
            <h4>
                <span className="bold">For the Rosenbrock function: </span>
                <Math
                    value="f(x,y) = (1 - x)^2 + b(100 - x^2)^2"
                    engine="asciimath"
                    inline
                />
            </h4>

            <ParametersTable
                register={register}
                errors={errors}
                configs={configs}
            />

            <div className="de-layout">
                {/* Left column - Plot (50%) */}
                <div className="de-left">
                    <Rosenbrock
                        customMarks={generateMarks(points, prevPoints)}
                        aspect={isColumnLayout ? 1 : 0.56}
                    />
                </div>

                {/* Right column - Buttons and Iteration Table (35%) */}
                <div className="de-right">
                    <div className="de-right-inner">
                        <div className="de-buttons">
                            <button
                                onClick={() => setIsRunning(!isRunning)}
                                onMouseEnter={() => setHoveredButton('start')}
                                onMouseLeave={() => setHoveredButton(null)}
                                style={{
                                    borderRadius: '8px',
                                    background:
                                        hoveredButton === 'start'
                                            ? 'rgba(0, 0, 0, 0.1)'
                                            : 'transparent',
                                    transition: 'background 0.2s ease',
                                    cursor: 'pointer',
                                }}
                            >
                                {isRunning ? 'Stop' : 'Start'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsRunning(false)
                                    const maxIterations = watch('iterations')
                                    const newIteration =
                                        iteration >= maxIterations
                                            ? 0
                                            : iteration + 1
                                    setIteration(newIteration)

                                    if (newIteration === 0) {
                                        setPoints(
                                            generateRandomPoints(
                                                -1.8,
                                                1.8,
                                                -0.8,
                                                2.8,
                                                populationSize
                                            )
                                        )
                                        setPrevPoints(null)
                                        setIterationLog([])
                                    } else {
                                        const result = updatePopulation(
                                            points,
                                            F,
                                            CR
                                        )
                                        setPrevPoints(points)
                                        setPoints(result.nextPoints)
                                        setIterationLog(result.log)
                                    }
                                }}
                                onMouseEnter={() => setHoveredButton('step')}
                                onMouseLeave={() => setHoveredButton(null)}
                                style={{
                                    borderRadius: '8px',
                                    background:
                                        hoveredButton === 'step'
                                            ? 'rgba(0, 0, 0, 0.1)'
                                            : 'transparent',
                                    transition: 'background 0.2s ease',
                                    cursor: 'pointer',
                                }}
                            >
                                Step Forward
                            </button>
                            <button
                                onClick={() => {
                                    setIsRunning(false)
                                    setIteration(0)
                                    setPoints(
                                        generateRandomPoints(
                                            -1.8,
                                            1.8,
                                            -0.8,
                                            2.8,
                                            populationSize
                                        )
                                    )
                                    setPrevPoints(null)
                                    setIterationLog([])
                                }}
                                onMouseEnter={() => setHoveredButton('reset')}
                                onMouseLeave={() => setHoveredButton(null)}
                                style={{
                                    borderRadius: '8px',
                                    background:
                                        hoveredButton === 'reset'
                                            ? 'rgba(0, 0, 0, 0.1)'
                                            : 'transparent',
                                    transition: 'background 0.2s ease',
                                    cursor: 'pointer',
                                }}
                            >
                                Reset
                            </button>
                        </div>
                        <IterationLogTable
                            log={iterationLog}
                            maxEntriesShown={4}
                        />
                        <IterationDetails
                            iteration={iteration}
                            points={points}
                            log={iterationLog}
                            F={F}
                            CR={CR}
                        />
                    </div>
                </div>
            </div>

            <div style={{ margin: '1rem auto', maxWidth: 1100 }}></div>
            <section></section>
        </article>
    )
}
