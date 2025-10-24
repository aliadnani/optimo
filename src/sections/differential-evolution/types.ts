import type { CustomMark } from '../../features/rossenbrock'

export type ParameterConfig = {
    min: number
    max: number
    symbol: string
    unit?: string
}

export type FormValues = {
    populationSize: number
    crossoverProbability: number
    differentialWeight: number
    iterations: number
    intervalDuration: number
}

export type Point = {
    colorHex: string
    x: number
    y: number
}

export type IterationLogEntry = {
    index: number
    prevX: number
    prevY: number
    prevFitness: number
    // parents chosen for mutation
    aIndex: number
    bIndex: number
    cIndex: number
    aX: number
    aY: number
    bX: number
    bY: number
    cX: number
    cY: number
    // mutation vector v = a + F (b - c)
    mutationX: number
    mutationY: number
    // crossover choices
    sourceX: 'v' | 'x'
    sourceY: 'v' | 'x'
    jRand: 0 | 1
    trialX: number
    trialY: number
    trialFitness: number
    accepted: boolean
    newX: number
    newY: number
}

export type { CustomMark }
