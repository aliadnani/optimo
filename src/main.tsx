import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'latex.css'
// import 'mathjax/es5/tex-mml-chtml.js'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)
