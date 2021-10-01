import { expect } from 'chai'
import 'mocha'
import { generateIntervals } from '../src/generateIntervals'
import { TimeFrame } from '../src/types'

const dateToTimestamp = (dateStr: string) => new Date(dateStr).getTime()

describe('Generate Intervals', () => {
	it('should generate 10 days', () => {
		const timeFrame: TimeFrame = {
			start: dateToTimestamp('2020-1-1'),
			end: dateToTimestamp('2020-1-10')
		}
		const intervals = generateIntervals(timeFrame, 'day')
		expect(intervals).to.have.lengthOf(10)
	})

	it('should generate 20 days', () => {
		const timeFrame: TimeFrame = {
			start: dateToTimestamp('2020-1-1'),
			end: dateToTimestamp('2020-1-20')
		}
		const intervals = generateIntervals(timeFrame, 'day')
		expect(intervals).to.have.lengthOf(20)
	})

	it('should generate 03 weeks', () => {
		const timeFrame: TimeFrame = {
			start: dateToTimestamp('2020-1-1'),
			end: dateToTimestamp('2020-1-21')
		}
		const intervals = generateIntervals(timeFrame, 'week')
		expect(intervals).to.have.lengthOf(3)
	})

	it('should generate 07 months', () => {
		const timeFrame: TimeFrame = {
			start: dateToTimestamp('2020-1-1'),
			end: dateToTimestamp('2020-8-1')
		}
		const intervals = generateIntervals(timeFrame, 'month')
		expect(intervals).to.have.lengthOf(7)
	})

	it('should generate 25 months', () => {
		const timeFrame: TimeFrame = {
			start: dateToTimestamp('2020-1-1'),
			end: dateToTimestamp('2022-1-1')
		}
		const intervals = generateIntervals(timeFrame, 'month')
		expect(intervals).to.have.lengthOf(25)
	})

	it('should generate 21 years', () => {
		const timeFrame: TimeFrame = {
			start: dateToTimestamp('2020-1-1'),
			end: dateToTimestamp('2040-1-1')
		}
		const intervals = generateIntervals(timeFrame, 'year')
		expect(intervals).to.have.lengthOf(21)
	})
})
