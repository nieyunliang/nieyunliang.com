import { Carousel } from 'antd'
import { getFileUrl } from '@/utils'
export default function AD() {
  return (
    <Carousel
      autoplay
      style={{ marginTop: 10 }}
    >
      <div>
        <a
          href='https://curl.qcloud.com/3MSaxbee'
          target='_blank'
        >
          <img
            src={getFileUrl('tencent.jpg')}
            style={{ width: '100%' }}
          />
        </a>
      </div>
      <div>
        <a
          href='https://curl.qcloud.com/lG1rtroV'
          target='_blank'
        >
          <img
            src={getFileUrl('rhino-design-560x300.png')}
            style={{ width: '100%' }}
          />
        </a>
      </div>
      <div>
        <a
          href='https://curl.qcloud.com/YHpNpJ4Q'
          target='_blank'
        >
          <img
            src={getFileUrl('new-user-560x300.jpg')}
            style={{ width: '100%' }}
          />
        </a>
      </div>
    </Carousel>
  )
}
