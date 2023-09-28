import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from '../pages/home'
import ChatAI from '../pages/chatai'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={<Home />}
        />
        <Route
          path='/chatai'
          element={<ChatAI />}
        />
      </Routes>
    </BrowserRouter>
  )
}
