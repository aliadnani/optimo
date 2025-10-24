import DifferentialEvolution from './sections/differential-evolution/index'

function App() {
    return (
        <div className="App">
            <header className="">
                <h1>Optimizations in Motion</h1>
                <p className="author">
                    Ali Imran
                    <br />
                    October 2025
                </p>
            </header>

            <div className="abstract">
                <h2>Abstract</h2>
                <p>
                    Interactive visualizations of some select optimization
                    algorithms. Only differential evolution is covered at the
                    moment; but more algorithms will be added in the future. I
                    want to cover line search, trust region methods, conjugate
                    gradient, gradient descent variants, and some more
                    evolutionary algorithms like particle swarm optimization.
                    Maybe genetic algorithms but those aren't so fun to
                    visualize.
                </p>
            </div>

            <main>
                <DifferentialEvolution />
            </main>
        </div>
    )
}

export default App
