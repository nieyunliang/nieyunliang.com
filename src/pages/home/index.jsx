import style from './index.module.less'
import logo from '@/assets/chatgpt-logo.svg'
import { useNavigate } from 'react-router'
export default function Home() {
  const navigate = useNavigate()
  const listener = e => {
    if (e.code === 'Enter') {
      navigate('/chatai')
    }
  }
  window.removeEventListener('keyup', listener)
  window.addEventListener('keyup', listener)
  return (
    <div className={style.container}>
      <div className={style.logo}>
        <img
          src={logo}
          style={{ width: 38 }}
        />
        <h1>GPT-4：</h1>
      </div>

      <h1 className={style.title}>What do you want to do ?</h1>
    </div>
  )
}
