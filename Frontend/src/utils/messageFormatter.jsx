/**
 * Message formatting utilities for React components
 */

// Character type checks
function isChineseCharacter(char) {
    return /[\u4e00-\u9fff]/.test(char);
}

function isEnglishLetter(char) {
    return /[a-zA-Z]/.test(char);
}

function isNumber(char) {
    return /[0-9]/.test(char);
}

function isPunctuation(char) {
    return /[,.!?;:'"()[\]{}]/.test(char);
}

function isWhitespace(char) {
    return /\s/.test(char);
}

/**
 * Format markdown headers properly
 * @param {string} text Input text with markdown headers
 * @returns {string} Formatted text with proper header spacing
 */
function formatMarkdownHeaders(text) {
    // Ensure proper spacing for headers
    return text
        .replace(/###\s*([^#\n]+)/g, '\n\n### $1\n\n')  // Level 3 headers
        .replace(/##\s*([^#\n]+)/g, '\n\n## $1\n\n')    // Level 2 headers
        .replace(/#\s*([^#\n]+)/g, '\n\n# $1\n\n')      // Level 1 headers
        .replace(/\n{3,}/g, '\n\n');                     // Remove excessive newlines
}

/**
 * Format bold text properly
 * @param {string} text Input text with bold markdown
 * @returns {string} Formatted text with proper bold syntax
 */
function formatBoldText(text) {
    return text
        .replace(/\*\*([^*\n]+?)\*\*/g, ' **$1** ')  // Add spaces around bold text
        .replace(/\s{2,}/g, ' ')                      // Remove extra spaces
        .trim();
}

/**
 * Format list items properly
 * @param {string} text Input text with markdown lists
 * @returns {string} Formatted text with proper list formatting
 */
function formatLists(text) {
    return text
        .replace(/^[-*+]\s+/gm, '\n- ')              // Unordered lists
        .replace(/^\d+\.\s+/gm, (match) => '\n' + match)  // Ordered lists
        .replace(/\n{3,}/g, '\n\n');                 // Clean up extra newlines
}

/**
 * Format paragraphs with proper spacing
 * @param {string} text Input text
 * @returns {string} Formatted text with proper paragraph spacing
 */
function formatParagraphs(text) {
    return text
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n');
}

/**
 * Main formatting function
 * @param {string} currentContent Existing content
 * @param {string} newContent New content to append
 * @param {boolean} isAIResponse Whether this is an AI response
 * @returns {string} Formatted content
 */
export function formatMessageContent(currentContent, newContent, isAIResponse = true) {
    if (!currentContent) return newContent;

    // Initial cleanup
    let formattedContent = currentContent;

    // Process the new content
    let processedContent = newContent
        .replace(/\r\n/g, '\n')                  // Normalize line endings
        .replace(/\n{3,}/g, '\n\n')             // Remove excessive newlines
        .trim();

    // Special handling for AI responses
    if (isAIResponse) {
        // Format headers
        processedContent = formatMarkdownHeaders(processedContent);

        // Format bold text
        processedContent = formatBoldText(processedContent);

        // Format lists
        processedContent = formatLists(processedContent);

        // Format paragraphs
        processedContent = formatParagraphs(processedContent);

        // Handle special cases for mixed content
        processedContent = processedContent
            // Fix spacing around punctuation
            .replace(/\s+([,.!?;:])/g, '$1')
            // Add space after punctuation if followed by a letter
            .replace(/([,.!?;:])([a-zA-Z])/g, '$1 $2')
            // Handle mixed Chinese-English text
            .replace(/([a-zA-Z])([\u4e00-\u9fff])/g, '$1 $2')
            .replace(/([\u4e00-\u9fff])([a-zA-Z])/g, '$1 $2')
            // Clean up extra spaces
            .replace(/\s{2,}/g, ' ');
    }

    // Append the processed content
    formattedContent += (formattedContent.endsWith('\n') ? '' : '\n') + processedContent;

    // Final cleanup
    return formattedContent
        .replace(/\n{3,}/g, '\n\n')     // Remove excessive newlines
        .replace(/\s+$/g, '\n')         // Ensure single newline at end
        .trim() + '\n';
}