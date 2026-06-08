import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Note: BrowserRouter and AuthProvider live inside App.jsx, so we don't wrap
// App in another <BrowserRouter> here — nested routers crash React Router.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
