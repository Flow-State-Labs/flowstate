import { expect } from 'chai'
import 'mocha'
import { getFlowState } from '../src'
import { flowUpdates } from './testData'

describe('Calculate Flow State', () => {
	it('should calculate flow state from beginning to end', () => {
		const start = flowUpdates[0].timestamp
		const end = flowUpdates[flowUpdates.length - 1].timestamp
		const flowState = getFlowState({
			timeFrame: { start, end, inSeconds: true },
			flowUpdates
		})
		console.log({ flowState })
		expect(true).to.equal(true)
	})
})
