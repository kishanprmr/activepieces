import { AskCopilotRequest, AskCopilotResponse, WebsocketClientEvent, WebsocketServerEvent } from '@activepieces/shared'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { websocketService } from '../websockets/websockets.service'
import { copilotService } from './copilot.service'

export const copilotModule: FastifyPluginAsyncTypebox = async (fastify) => {
    websocketService.addListener(WebsocketServerEvent.ASK_COPILOT, (socket) => {
        return async (request: AskCopilotRequest) => {
            const principal = await websocketService.verifyPrincipal(socket)
            const response: AskCopilotResponse | null = await copilotService(fastify.log).ask(principal.projectId, principal.platform.id, request)
            socket.emit(WebsocketClientEvent.ASK_COPILOT_FINISHED, response)
        }
    })

}

