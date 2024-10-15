import { request } from "@/utils";

// elastic search normal search
export function searchAPI(keyword){
    return request({
        url: `/records-search/search`,
        method: 'GET',
        params: {
            keyword: keyword
        }
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}