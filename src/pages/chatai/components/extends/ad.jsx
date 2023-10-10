import { Carousel } from 'antd'
import { getFileUrl } from '@/utils'
import { Modal, Button } from 'antd'
import { useBoolean } from 'ahooks'
export default function AD() {
  const [modalOpen, { setTrue, setFalse }] = useBoolean(false)
  return (
    <>
      <Button
        type='primary'
        danger
        style={{ marginTop: 10 }}
        onClick={setTrue}
      >
        领支付宝红包
      </Button>
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
      <Modal
        title='扫码领红包'
        open={modalOpen}
        closeIcon={false}
        footer={() => (
          <Button
            type='primary'
            onClick={setFalse}
          >
            关闭
          </Button>
        )}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src={getFileUrl('hongbao.jpg')}
            style={{ height: 400 }}
          />
        </div>
      </Modal>
    </>
  )
}
