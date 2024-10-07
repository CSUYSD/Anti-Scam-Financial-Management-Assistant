import { request } from "@/utils"

/**
 * Message API
 * @param {Object} params - The message form data
 * @returns {Promise} - The API response
 */
export function MessageAPI(params) {
    console.log("Sending message data:", params.toString())
    return request({
        url: '/message/chat',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: params.toString()
    })
}

/**
 * Flux Message API
 * @param {Object} params - The message form data
 * @returns {Promise} - The API response
 */
export function FluxMessageAPI(params) {
    console.log("Sending flux message data:", params.toString())
    return request({
        url: '/message/chat/stream',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: params.toString()
    })
}

/**
 * Flux Message with History API
 * @param {Object} params - The message form data
 * @returns {Promise} - The API response
 */
export function FluxMessageWithHistoryAPI(params) {
    const requestData = new URLSearchParams({
        prompt: params.prompt,
        sessionId: params.sessionId
    });
    console.log("Sending flux message data:", requestData.toString());
    return request({
        url: '/message/chat/stream/history',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: requestData.toString(),
        responseType: 'text'
    });
}

/**
 * Upload File API
 * @param {Object} formData - The file form data
 * @returns {Promise} - The API response
 */
export function UploadFileAPI(formData) {
    console.log("Uploading file data:", formData)
    return request({
        url: '/etl/embedding/multipart',
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formData
    })
}

/**
 * Chat with File API
 * @param {Object} params - The chat form data
 * @returns {Promise} - The API response
 */
export function ChatWithFileAPI(params) {
    const requestData = new URLSearchParams({
        prompt: params.get('prompt'),
        sessionId: params.get('sessionId'),
    });
    console.log("Sending chat with file data:", requestData.toString());
    return request({
        url: '/document/chat/stream/database',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: requestData.toString(),
        responseType: 'text'
    })
}
