export default function Audio() {
	const init = () => {
		// 初始化音频上下文
		const audioContext = new AudioContext()
		// 获取音频资源
		const audioElement = document.getElementById('my-audio-element')
		const sourceNode = audioContext.createMediaElementSource(audioElement)
		// 创建ScriptProcessorNode节点
		const scriptNode = new AudioWorkletNode(audioContext, 'my-script-processor')
		// 连接节点
		sourceNode.connect(scriptNode)
		scriptNode.connect(audioContext.destination)
		// 定义音频处理函数
		scriptNode.port.onmessage = function (event) {
			const outputAudioBuffer = event.data.outputBuffer
			// 将输出的数据写入输出缓冲区
			const output = outputAudioBuffer.getChannelData(0)
			// 以0.5的速度播放音频
			for (let i = 0; i < output.length; i++) {
				output[i] =
					event.data.inputBuffer.getChannelData(0)[Math.floor(i * 0.5)]
			}
		}
	}
	return (
		<audio
			id='my-audio-element'
			src='my-audio-file.mp3'
			controls
		></audio>
	)
}
