import { request } from "@/utils"


/**
 * Flux Message with History API
 * @param {Object} params - The message form data
 * @returns {Promise} - The API response
 */
export function FluxMessageWithHistoryAPI(params) {
    console.log("Sending flux message data:", params);
    return request({
        url: '/ai/chat/general',
        method: 'GET',
        params: {
            prompt: params.prompt,
            sessionId: params.sessionId
        },
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
        url: '/vector-db/etl/read/multipart',
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formData
    })
}

export function ClearFileByFileNameAPI(fileName) {
    return request ({
        url: `/vector-db/etl/delete/${fileName}`,
        method: "DELETE",
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}


export function ClearFileAPI() {
    return request({
        url: '/vector-db/etl/clear',
        method: 'GET'
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}


export function ChatWithFileAPI(formdata) {
    console.log("Sending chat with file data:", formdata);
    return request({
        url: "/ai/chat/rag",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            inputMessage: formdata.inputMessage,
            params: formdata.params
        })
    });
}

export function ChatAPI(params) {
    return request ({
        url: "/ai/chat/chatWithoutMemory",
        method: "GET",
        params: {
            prompt: params.prompt
        },
    })
}


export function GenerateReport() {
    return request ({
        url: "/ai/analyser/financial-report",
        method: "POST"
    })
}


export function GetReportAPI() {
    console.log("generate ai report");
    return request({
        url: "/financial-report",
        method: 'GET'
    });
}
