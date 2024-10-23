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

// elastic search advanced search
export function advancedSearchAPI({ description, type, minAmount, maxAmount }) {
    return request({
        url: `/records-search/advanced-search`,
        method: 'GET',
        params: {
            description,
            type,
            minAmount,
            maxAmount
        }
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}