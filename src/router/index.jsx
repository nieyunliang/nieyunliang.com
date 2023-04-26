import { Routes, Route, HashRouter } from 'react-router-dom'
import ChatAI from '../pages/ChatAI'

export default function Router() {
	return (
		<HashRouter>
			<Routes>
				<Route
					path='/chatai'
					element={<ChatAI />}
				/>
			</Routes>
		</HashRouter>
	)
}
