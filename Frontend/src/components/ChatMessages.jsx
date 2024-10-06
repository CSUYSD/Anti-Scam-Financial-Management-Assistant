import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Avatar,
    IconButton,
    Chip,
} from '@mui/material';
import {
    Person as PersonIcon,
    SmartToy as AIIcon,
    Refresh as RefreshIcon,
    ContentCopy as CopyIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export const ChatMessages = ({
                                 messages,
                                 username,
                                 isTyping,
                                 handleRetry,
                                 handleCopy,
                                 handleDownload,
                             }) => {
    const renderMessage = (content, sender) => {
        if (sender === 'AI') {
            const processedContent = content
                .split('\n')
                .map(line => line.trim())
                .join('\n')
                .replace(/\n{3,}/g, '\n\n');

            return (
                <>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeRaw, rehypeKatex]}
                    >
                        {processedContent}
                    </ReactMarkdown>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <IconButton onClick={() => handleRetry()} size="small">
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleCopy(processedContent)} size="small">
                            <CopyIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleDownload(processedContent)} size="small">
                            <DownloadIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </>
            );
        } else {
            return (
                <Typography
                    variant="body1"
                    sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}
                >
                    {content}
                </Typography>
            );
        }
    };

    return (
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            <AnimatePresence>
                {messages.map((msg, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: msg.sender === username ? 'flex-end' : 'flex-start' }}>
                            <Paper elevation={1} sx={{
                                maxWidth: '70%',
                                p: 2,
                                borderRadius: 2,
                                bgcolor: msg.sender === username ? 'primary.light' : 'background.paper',
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: msg.sender === username ? 'primary.main' : 'secondary.main' }}>
                                        {msg.sender === username ? <PersonIcon fontSize="small" /> : <AIIcon fontSize="small" />}
                                    </Avatar>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                        {msg.sender === username ? username : 'AI'}
                                    </Typography>
                                </Box>
                                {renderMessage(msg.content, msg.sender)}
                            </Paper>
                        </Box>
                    </motion.div>
                ))}
            </AnimatePresence>
            {isTyping && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                    <Chip
                        icon={<AIIcon />}
                        label="AI is typing..."
                        variant="outlined"
                        color="secondary"
                        size="small"
                        sx={{ animation: 'pulse 1.5s infinite' }}
                    />
                </Box>
            )}
        </Box>
    );
};