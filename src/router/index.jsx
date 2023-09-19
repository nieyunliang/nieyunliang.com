import { Routes, Route, BrowserRouter } from 'react-router-dom'
import ChatAI from '../pages/chat-aI'
import Home from '../pages/home'

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
