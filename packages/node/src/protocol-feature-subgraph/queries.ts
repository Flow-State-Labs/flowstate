// this is a mega query built for supertokenomics
// you probably dont need this
export const allFlowUpdates = (timestamp: string) =>
	`{
        flowUpdates: flowUpdateds (
            first: 1000,
            orderBy: timestamp,
            where: {
                timestamp_gt: "${timestamp}"
            }
        ) {
            id,
            transactionHash,
            timestamp,
            blockNumber,
            superTokenAddress: token,
            sender,
            recipient: receiver,
            flowRate,
            oldFlowRate,
            type,
            flow: stream {
                id
            }
        }
    }`.replace(/[\n\s\t]/, '') // remove all whitespace

// sender and receiver optional,
// if not passed here, it is omitted in the query string
export const addressFlowUpdates = (
	timestamp: string,
	filter: string,
	sender?: string,
	receiver?: string
) =>
	`{
        flowUpdates: flowUpdateds (
            first: 1000,
            orderBy: timestamp,
            where: {
                timestamp_gt: "${timestamp}",
                ${sender && `sender: "${sender}"",`}
                ${receiver && `receiver: "${receiver}"",`}
                ${filter}
            }
        ) {
            id,
            transactionHash,
            timestamp,
            blockNumber,
            superTokenAddress: token,
            sender,
            recipient: receiver,
            flowRate,
            oldFlowRate,
            type,
            flow: stream {
                id
            }
        }
    }`.replace(/[\n\s\t]/, '') // compact
