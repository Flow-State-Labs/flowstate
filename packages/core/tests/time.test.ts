import { expect } from 'chai'
import 'mocha'
import { millisecondToSecond, secondToMillisecond } from '../src/time'

describe('Time Tests', () => {
	it('should convert milliseconds to seconds', () => {
		let milliseconds = 1_000
		let seconds = 1

		expect(millisecondToSecond(milliseconds)).to.equal(seconds)

		milliseconds = 35_000
		seconds = 35
		expect(millisecondToSecond(milliseconds)).to.equal(seconds)
	})

	it('should convert seconds to milliseconds', () => {
		let seconds = 1
		let milliseconds = 1_000

		expect(secondToMillisecond(seconds)).to.equal(milliseconds)
		seconds = 35
		milliseconds = 35_000

		expect(secondToMillisecond(seconds)).to.equal(milliseconds)
	})
})

// noop
export default {}
