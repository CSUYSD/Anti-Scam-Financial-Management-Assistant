import { request } from "@/utils";

// Get all accounts
export function getAllAccountsAPI() {
    return request({
        url: '/account/all',
        method: 'GET',
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// switch account
export function switchAccountAPI(id) {
    return request({
        url: `/account/switch`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        params: {
            accountId: id,
        },
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// Create a new account
export function createAccountAPI(accountData) {
    return request({
        url: '/account/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(accountData),
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// Get current account
export function getCurrentAccountAPI() {
    return request({
        url: `/account/current`,
        method: 'GET',
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// Update an existing account
export function updateAccountAPI(id, accountData) {
    return request({
        url: `/account/update/${id}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(accountData),
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// Delete an account
export function deleteAccountAPI(id) {
    return request({
        url: `/account/${id}`,
        method: 'DELETE',
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// Helper function to handle API errors
export function handleApiError(error) {
    if (error.response) {
        console.error('API Error Response:', error.response.data);
        console.error('API Error Status:', error.response.status);
        console.error('API Error Headers:', error.response.headers);

        switch (error.response.status) {
            case 401:
                return '未授权，请重新登录';
            case 404:
                return '请求的资源不存在';
            case 409:
                return '账户名已存在，请选择不同的账户名';
            case 500:
                return '服务器内部错误，请稍后再试';
            default:
                return '发生错误，请稍后再试';
        }
    } else if (error.request) {
        console.error('API Error Request:', error.request);
        return '无法连接到服务器，请检查您的网络连接';
    } else {
        console.error('API Error Message:', error.message);
        return '发生未知错误，请稍后再试';
    }
}