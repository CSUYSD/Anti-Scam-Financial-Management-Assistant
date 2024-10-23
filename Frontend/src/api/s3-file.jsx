import { request } from "@/utils"

export function DownloadFile(fileName) {
    return request({
        url: "/file/download",
        method: "GET",
        params: {
            fileName: fileName
        },
        responseType: "blob"
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}


export function GetAllFiles() {
    return request({
        url: "/file/get-all",
        method: "GET"
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}


export function DeleteFileByFileName(fileName) {
    return request ({
        url: "/file/delete",
        method: "POST",
        params: {
            fileName: fileName
        }
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}