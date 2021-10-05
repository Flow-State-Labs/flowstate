import axios from 'axios'
import { baseUrl } from './endpoint'
import { allFlowUpdates } from './queries'
import type { QueryFlowUpate, QueryData } from './types'
import { FlowUpdate, FlowState, getFlowState } from '@flowstate/core'

export const getAllFlowUpdates = async (): Promise<Array<FlowState>> => {
	// pagination hack
	let timestamp = '0'
	let flowUpdates: QueryFlowUpate[] = []
	const query = allFlowUpdates(timestamp)
	while (true) {
		try {
			const result = await axios.post(baseUrl, { query })
			const { flowUpdates: queryFlowUpdates }: QueryData = (
				result.data as any
			).data
			flowUpdates = flowUpdates.concat(queryFlowUpdates)
			console.log({ flowUpdates: flowUpdates.length })
			timestamp = flowUpdates[flowUpdates.length - 1].timestamp
			if (queryFlowUpdates.length < 1000) break
		} catch (error) {
			throw error
		}
	}

	const formattedFlowUpdates: Array<FlowUpdate> = flowUpdates.map(
		flowUpdate => ({
			flowId: flowUpdate.flow.id,
			timestamp: parseInt(flowUpdate.timestamp),
			flowRate: flowUpdate.flowRate,
			oldFlowRate: flowUpdate.oldFlowRate,
			type: flowUpdate.type,
			sender: flowUpdate.sender,
			recipient: flowUpdate.recipient,
			transactionHash: flowUpdate.transactionHash,
			token: flowUpdate.superTokenAddress
		})
	)
	console.log(formattedFlowUpdates)

	return getFlowState({
		timeFrame: {
			start: parseInt(flowUpdates[0].timestamp),
			end: parseInt(timestamp),
			inSeconds: true
		},
		flowUpdates: formattedFlowUpdates
	})
}
