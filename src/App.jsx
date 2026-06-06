
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Navbar } from './components/Navbar'
import { footer as Footer } from './pages/footer'
import { HomePage as Home } from './pages/HomePage'
import ScrollToTop from './components/ScrollToTop'

function App() {

  return (
    <>
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
       </BrowserRouter>
    </>
  )
}

export default App
