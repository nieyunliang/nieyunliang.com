import { Routes, Route, BrowserRouter } from 'react-router-dom'
import ChatAI from '../pages/ChatAI'
import Audio from '../pages/Audio'

export default function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path='/chatai'
					element={<ChatAI />}
				/>
				<Route
					path='/audio'
					element={<Audio />}
				/>
			</Routes>
		</BrowserRouter>
	)
}
