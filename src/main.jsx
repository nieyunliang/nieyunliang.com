import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ConfigProvider, App as AntdApp } from 'antd'
import EscapeAntd from './utils/escapeantd'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={{ token: { colorPrimary: '#11a37f' } }}>
      <AntdApp>
        <App />
        <EscapeAntd />
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>
)
