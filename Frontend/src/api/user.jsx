import {request} from "@/utils"


export function loginAPI(formData){
    return  request({
        url:'/login',
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: formData
    })
}

export function signUpAPI(formData){
    return  request({
        url:'/signup',
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: formData
    })
}

export function logoutAPI(){
    return  request({
        url:'/logout',
        method:'GET',
    })
}


export function getProfileAPI(){
    return  request({
        url:'/user/profile',
        method:'GET',
    })
}