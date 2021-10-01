import { generateIntervals } from './generateIntervals'
import { FlowUpdateType, FlowUpdate, FlowStateParams, FlowState } from './types'
import BN from 'bn.js'

export function getFlowState({
	timeFrame,
	flowUpdates,
	granularity: optGranularity
}: FlowStateParams): Array<FlowState> {
	const granularity = optGranularity || 'day'
	// ALWAYS returns intervals in seconds
	const intervals = generateIntervals(timeFrame, granularity)

	let flowState: Array<FlowState> = []
	// loop the intervals
	for (let index = 0; index < intervals.length - 1; ++index) {
		const intervalFlowState = getIntervalFlowState({
			timeFrame: {
				start: intervals[index],
				end: intervals[index] + 1
			},
			flowUpdates
		})
		flowState = flowState.concat(intervalFlowState)
	}
	return flowState
}

export function getIntervalFlowState({
	timeFrame,
	flowUpdates
}: FlowStateParams): Array<FlowState> {
	const { start, end } = timeFrame

	// loop once to split flowUpdates:
	// beginning of arr to startTime, startTime to endTime
	let startIndex, endIndex, iterator
	for (iterator = 0; iterator <= flowUpdates.length; ++iterator) {
		if (flowUpdates[iterator].timestamp >= start) {
			// last index before startTime
			startIndex = iterator - 1
		} else if (flowUpdates[iterator].timestamp >= end) {
			// last index before endTime
			endIndex = iterator - 1
		}
	}
	const flowUpdatesBeforeStart = flowUpdates.slice(0, startIndex)
	const flowUpdatesStartToEnd = flowUpdates.slice(startIndex, endIndex)

	// flowUpdates without a closing update
	let openFlows: Array<FlowUpdate> = []

	// loop again to find flows opened and updated but NOT closed before start
	for (const flowUpdate of flowUpdatesBeforeStart) {
		switch (flowUpdate.type) {
			case FlowUpdateType.Created:
				openFlows.push(flowUpdate)
				break
			case FlowUpdateType.Updated:
				const updateIndex = openFlows.findIndex(
					flow => flow.id === flowUpdate.id
				)
				openFlows[updateIndex] = flowUpdate
				break
			case FlowUpdateType.Deleted:
				const deleteIndex = openFlows.findIndex(
					flow => flow.id === flowUpdate.id
				)
				openFlows[deleteIndex] = flowUpdate
				break
			default:
				throw Error(`Unexpected flowUpdate type: ${flowUpdate.type}`)
		}
	}

	let flowState: Array<FlowState> = []
	// loop a third time to handle events throughout the timeFrame
	for (const flowUpdate of flowUpdatesStartToEnd) {
		const flowStateIndex = flowState.findIndex(
			flow => flow.flowId === flowUpdate.id
		)
		switch (flowUpdate.type) {
			case FlowUpdateType.Created:
				if (flowStateIndex !== -1) {
					flowState.push({
						flowId: flowUpdate.id,
						updates: [flowUpdate.timestamp],
						amount: '0',
						sender: flowUpdate.sender,
						recipient: flowUpdate.recipient,
						transactionHash: flowUpdate.transactionHash,
						token: flowUpdate.token
					})
				}
				break
			case FlowUpdateType.Updated:
				// code block due to naming collisions between update and delete
				{
					// amount += lastSum + oldFlowRate * (timestamp - lastTimestamp)
					const { amount: lastSum, updates: lastUpdates } =
						flowState[flowStateIndex]
					const lastTimestamp = lastUpdates[lastUpdates.length - 1]
					const streamedSinceLastUpdate = new BN(
						flowUpdate.oldFlowRate
					).mul(new BN(flowUpdate.timestamp - lastTimestamp))
					// calculate updates
					const amount = new BN(lastSum)
						.add(streamedSinceLastUpdate)
						.toString()
					const updates = lastUpdates.push(flowUpdate.timestamp)
					// update amount and updates on the flowState object
					Object.assign(flowState[flowStateIndex], {
						amount,
						updates
					})
					// on update, update openFlows to latest flowUpdate
					// this is for a loop over openFlows
					const openFlowIndex = openFlows.findIndex(
						flow => flow.id === flowUpdate.id
					)
					openFlows[openFlowIndex] = flowUpdate
				}
				break

			case FlowUpdateType.Deleted:
				// code block due to naming collisions between update and delete
				{
					// amount += lastSum + oldFlowRate * (timestamp - lastTimestamp)
					const { amount: lastSum, updates: lastUpdates } =
						flowState[flowStateIndex]
					const lastTimestamp = lastUpdates[lastUpdates.length - 1]
					const streamedSinceLastUpdate = new BN(
						flowUpdate.oldFlowRate
					).mul(new BN(flowUpdate.timestamp - lastTimestamp))
					// calculate updates
					const amount = new BN(lastSum)
						.add(streamedSinceLastUpdate)
						.toString()
					const updates = lastUpdates.push(flowUpdate.timestamp)
					Object.assign(flowState[flowStateIndex], {
						amount,
						updates
					})
					// on delete, delete flowUpdate from openFlows
					// this is for a loop over openFlows
					const openFlowIndex = openFlows.findIndex(
						flow => flow.id === flowUpdate.id
					)
					openFlows.splice(openFlowIndex, 1)
				}
				break
			default:
				throw Error(`Unexpected flowUpdate type: ${flowUpdate.type}`)
		}
	}

	// final pass over flows not closed before the end of the day
	for (const openFlow of openFlows) {
		const flowStateIndex = flowState.findIndex(
			flow => flow.flowId === openFlow.id
		)
		if (flowStateIndex !== -1) {
			// if flow is open, and is on flowState
			// flowState should have the final update before the endTime
			const { updates: lastUpdates, amount: lastAmount } =
				flowState[flowStateIndex]

			const updates = lastUpdates.push(end)
			const amount = new BN(lastAmount).add(
				new BN(openFlow.flowRate).mul(new BN(end - openFlow.timestamp))
			)
			Object.assign(flowState[flowStateIndex], {
				updates,
				amount
			})
		} else {
			// if a flow is open, but not on flowState,
			// the flow was not updated throughout the day.
			// Push with flowRate * (end - start)
			const {
				id: flowId,
				sender,
				recipient,
				transactionHash,
				token
			} = openFlow

			const amount = new BN(openFlow.flowRate)
				.mul(new BN(end - start))
				.toString()

			flowState.push({
				flowId,
				updates: [start, end],
				amount,
				sender,
				recipient,
				transactionHash,
				token
			})
		}
	}

	return flowState
}
