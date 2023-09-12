import { Routes, Route, BrowserRouter } from 'react-router-dom'
import ChatAI from '../pages/ChatAI'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/chatai'
          element={<ChatAI />}
        />
      </Routes>
    </BrowserRouter>
  )
}
