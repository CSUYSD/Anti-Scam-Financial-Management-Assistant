import { request } from "@/utils";

// Get all records for an account
export function getAllRecordsAPI() {
    return request({
        url: `/records/all`,
        method: 'GET',
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// Get a specific record by ID for an account
export function getRecordByIdAPI(id) {
    return request({
        url: `/records/${id}`,
        method: 'GET',
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// get recent records
export function getRecentRecordsAPI(duration) {
    return request({
        url: `/records/recent`,
        method: 'GET',
        params: {
            duration: duration,
        },
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// Get records by type (income or expense)
export function getRecordsByTypeAPI(type) {
    return request({
        url: `/records/by-type/${type}`,
        method: 'GET',
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// Create a new transaction record
export function createRecordAPI(transactionRecord) {
    console.log('Creating record:', transactionRecord);
    return request({
        url: '/records/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(transactionRecord),
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// Update an existing transaction record
export function updateRecordAPI(id, transactionRecord) {
    return request({
        url: `/records/update/${id}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(transactionRecord),
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// Delete a transaction record
export function deleteRecordAPI(id) {
    return request({
        url: `/records/delete/${id}`,
        method: 'DELETE',
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// Delete multiple records in batch
export function deleteRecordsInBatchAPI( recordIds) {
    return request({
        url: `/records/batch`,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(recordIds),
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}