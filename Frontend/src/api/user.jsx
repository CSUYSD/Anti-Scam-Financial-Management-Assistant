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
        url:'/users/info',
        method:'GET',
    })
}

export function updatePasswordAPI( oldPassword, newPassword) {
    return request({
        url: '/updatePwd',
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            oldPassword: oldPassword,
            newPassword: newPassword
        }
    });
}

export function updateUserAPI( TransactionUserDTO) {
    return request({
        url: `/users/update/info`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        data: TransactionUserDTO
    });
}


export function updateAvatarAPI(avatarUrl) {
    return request({
        url: '/users/updateAvatar',
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            avatar: avatarUrl
        }
    });
}