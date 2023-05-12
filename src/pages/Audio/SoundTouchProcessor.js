// SoundTouch脚本处理器
class SoundTouchProcessor extends AudioWorkletProcessor {
	constructor() {
		super()
		this.soundTouch = new window.SoundTouch()
		this.soundTouch.pitch = -6
		// 接收从主线程发送的事件
		this.port.onmessage = event => {
			const inputAudioBuffer = event.data.inputBuffer
			const outputAudioBuffer = event.data.outputBuffer
			const channels = inputAudioBuffer.numberOfChannels
			const sampleRate = inputAudioBuffer.sampleRate
			const inputData = []
			const outputData = []
			for (let c = 0; c < channels; ++c) {
				inputData[c] = inputAudioBuffer.getChannelData(c)
				outputData[c] = new Float32Array(inputAudioBuffer.length)
			}
			// 处理音频
			this.soundTouch.tempo = event.data.tempo
			const numFrames = this.soundTouch.process(
				inputData,
				inputData.length,
				outputData
			)
			// 输出音频
			for (let c = 0; c < channels; ++c) {
				outputAudioBuffer.copyToChannel(outputData[c], c)
			}
			this.port.postMessage({
				outputBuffer: outputAudioBuffer,
			})
		}
	}

	process(inputs, outputs) {
		// 需要process()以满足AudioWorkletProcessor要求
		return true
	}
}
// 注册音频处理脚本
audioContext.audioWorklet.addModule('soundtouch-processor.js').then(() => {
	// 获取音频资源
	const audioElement = document.getElementById('my-audio-element')
	const sourceNode = audioContext.createMediaElementSource(audioElement)
	// 创建自定义音频处理脚本节点
	const soundTouchProcessor = new AudioWorkletNode(
		audioContext,
		'soundtouch-processor'
	)
	// 将节点连接到音频资源
	sourceNode.connect(soundTouchProcessor)
	soundTouchProcessor.connect(audioContext.destination)
	// 发送事件到脚本处理器
	soundTouchProcessor.port.postMessage({
		inputBuffer: null,
		outputBuffer: null,
		tempo: 1.0,
	})
})
