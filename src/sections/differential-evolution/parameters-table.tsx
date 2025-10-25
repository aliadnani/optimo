import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { FormValues, ParameterConfig } from './types'

type Props = {
    register: UseFormRegister<FormValues>
    errors: FieldErrors<FormValues>
    configs: {
        population: ParameterConfig
        crossover: ParameterConfig
        differentialWeight: ParameterConfig
        iterations: ParameterConfig
        interval: ParameterConfig
    }
}

export default function ParametersTable({ register, errors, configs }: Props) {
    const getConstraintText = (config: ParameterConfig) =>
        `${config.min} ≤ ${config.symbol} ≤ ${config.max}`

    return (
        <div className="table-scroll" style={{ overflowX: 'auto' }}>
            <table
                className="de-params"
                style={{
                    width: '100%',
                    minWidth: 520,
                }}
            >
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
                                min={configs.population.min}
                                max={configs.population.max}
                                step={1}
                                required
                                {...register('populationSize', {
                                    min: configs.population.min,
                                    max: configs.population.max,
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
                                {getConstraintText(configs.population)}
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
                                min={configs.crossover.min}
                                max={configs.crossover.max}
                                step="0.1"
                                required
                                {...register('crossoverProbability', {
                                    min: configs.crossover.min,
                                    max: configs.crossover.max,
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
                                {getConstraintText(configs.crossover)}
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
                                min={configs.differentialWeight.min}
                                max={configs.differentialWeight.max}
                                step="0.1"
                                required
                                {...register('differentialWeight', {
                                    min: configs.differentialWeight.min,
                                    max: configs.differentialWeight.max,
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
                                {getConstraintText(configs.differentialWeight)}
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
                                min={configs.iterations.min}
                                max={configs.iterations.max}
                                step={1}
                                required
                                {...register('iterations', {
                                    min: configs.iterations.min,
                                    max: configs.iterations.max,
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
                                {getConstraintText(configs.iterations)}
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
                                min={configs.interval.min}
                                max={configs.interval.max}
                                step={10}
                                required
                                {...register('intervalDuration', {
                                    min: configs.interval.min,
                                    max: configs.interval.max,
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
                                {getConstraintText(configs.interval)}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
