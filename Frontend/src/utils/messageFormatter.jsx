// src/utils/messageFormatter.js

// 判断是否为中文字符
function isChineseCharacter(char) {
    return /[\u4e00-\u9fff]/.test(char);
}

// 判断是否为字母字符
function isEnglishLetter(char) {
    return /[a-zA-Z]/.test(char);
}

// 判断是否为数字
function isNumber(char) {
    return /[0-9]/.test(char);
}

// 判断是否为标点符号
function isPunctuation(char) {
    return /[,.!?]/.test(char);
}

// 格式化消息内容，根据语言类型判断是否需要添加空格
export function formatMessageContent(currentContent, newContent) {
    if (!currentContent) return newContent;

    const lastChar = currentContent.slice(-1);
    const firstNewChar = newContent[0];

    // 如果前一个字符是英文且新内容也是英文，则需要判断是否添加空格
    if (
        isEnglishLetter(lastChar) && (isEnglishLetter(firstNewChar) || isNumber(firstNewChar))
    ) {
        // 英文字母和数字之间添加空格
        return `${currentContent} ${newContent}`;
    }

    // 如果前一个字符是标点符号，后面是英文或数字，也添加空格
    if (
        isPunctuation(lastChar) && (isEnglishLetter(firstNewChar) || isNumber(firstNewChar))
    ) {
        return `${currentContent} ${newContent}`;
    }

    // 中文与其他语言之间通常不需要空格
    if (
        (isChineseCharacter(lastChar) && !isChineseCharacter(firstNewChar)) ||
        (!isChineseCharacter(lastChar) && isChineseCharacter(firstNewChar))
    ) {
        return `${currentContent}${newContent}`;
    }

    // 默认情况下，直接拼接
    return `${currentContent}${newContent}`;
}