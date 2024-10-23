
/**
 * 获取文件类型
 * @param {string} fileName 文件名
 * @returns {string} 文件类型
 */
export const getFileType = (fileName) => {
    if (!fileName) return 'unknown';
    const extension = fileName.split('.').pop().toLowerCase();

    const fileTypes = {
        // 文本文件
        'txt': 'text',
        'md': 'text',
        'log': 'text',
        'json': 'text',
        'csv': 'text',

        // 文档文件
        'doc': 'word',
        'docx': 'word',
        'rtf': 'word',
        'odt': 'word',

        // PDF文件
        'pdf': 'pdf',

        // 图片文件
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'gif': 'image',
        'bmp': 'image',
        'webp': 'image',

        // Excel文件
        'xlsx': 'excel',
        'xls': 'excel',
        'xlsm': 'excel',
        'ods': 'excel',

        // 代码文件
        'js': 'code',
        'ts': 'code',
        'py': 'code',
        'java': 'code',
        'cpp': 'code',
        'html': 'code',
        'css': 'code',

        // 压缩文件
        'zip': 'archive',
        'rar': 'archive',
        '7z': 'archive',
        'tar': 'archive',
        'gz': 'archive'
    };

    return fileTypes[extension] || 'unknown';
};



/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的大小
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

