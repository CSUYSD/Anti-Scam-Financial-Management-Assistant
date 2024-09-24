import {request} from "@/utils"

export function MessageAPI(formData){
    return  request({
        url:'/message/chat',
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: formData
    })
}

export function FluxMessageAPI(formData){
    return  request({
        url:'/message/chat/stream',
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: formData
    })
}

export function FluxMessageWithHistoryAPI(formData){
    return  request({
        url:'/message/chat/stream/history',
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: formData
    })
}

export function UploadFileAPI(formData){
    return  request({
        url:'/document/embedding',
        method:'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formData
    })
}

export function ChatWithFileAPI(formData){
    return  request({
        url:'/document/chat/stream/database',
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: formData
    })
}