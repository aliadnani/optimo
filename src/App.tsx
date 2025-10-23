import DifferentialEvolution from './sections/differential-evolution'

function App() {
    return (
        <div className="App">
            <header className="">
                <h1>Optimo</h1>
                <p className="author">
                    Ali Imran
                    <br />
                    October 2025
                </p>
            </header>

            <div className="abstract">
                <h2>Abstract</h2>
                <p>
                    Interactive visualizations of optimaization algorithms. We
                    learned a lot of them - but not all of them are fun to
                    visualize. Here are the ones that are!
                </p>
            </div>

            <main>
                <DifferentialEvolution />
            </main>
        </div>
    )
}

export default App
