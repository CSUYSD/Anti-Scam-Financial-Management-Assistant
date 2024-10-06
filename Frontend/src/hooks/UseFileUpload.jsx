import { useState, useEffect } from 'react';
import { UploadFileAPI } from '@/api/ai';

export function useFileUpload() {
    const [files, setFiles] = useState(() => {
        try {
            const savedFiles = localStorage.getItem('uploadedFiles');
            return savedFiles ? JSON.parse(savedFiles) : [];
        } catch (error) {
            console.error('Error loading files from localStorage:', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('uploadedFiles', JSON.stringify(files));
        } catch (error) {
            console.error('Error saving files to localStorage:', error);
        }
    }, [files]);

    const uploadFile = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await UploadFileAPI(formData);
            if (response.status === 200) {
                const fileMetadata = {
                    name: file.name,
                    lastModified: file.lastModified,
                    size: file.size,
                    type: file.type
                };
                setFiles(prev => [...prev, fileMetadata]);
                return true;
            } else {
                throw new Error('File upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            return false;
        }
    };

    const clearFiles = () => {
        setFiles([]);
    };

    return { files, uploadFile, clearFiles };
}