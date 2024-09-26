import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  useTheme,
  alpha,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Paper,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Send as SendIcon,
  Upload as UploadIcon,
  InsertDriveFile as FileIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  SmartToy as AIIcon,
  Menu as MenuIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import {
  MessageAPI,
  FluxMessageAPI,
  FluxMessageWithHistoryAPI,
  ChatWithFileAPI,
  UploadFileAPI
} from '@/api/ai';

export default function ChatInterface() {
  const theme = useTheme();
  const [sessions, setSessions] = useState(() => {
    try {
      const savedSessions = localStorage.getItem('chatSessions');
      return savedSessions ? JSON.parse(savedSessions) : [{ id: uuidv4(), name: 'New Chat', messages: [] }];
    } catch (error) {
      console.error('Error loading sessions from localStorage:', error);
      return [{ id: uuidv4(), name: 'New Chat', messages: [] }];
    }
  });
  const [activeSession, setActiveSession] = useState(() => sessions[0]?.id || '');
  const [message, setMessage] = useState('');
  const [isRetrievalMode, setIsRetrievalMode] = useState(false);
  const [files, setFiles] = useState(() => {
    try {
      const savedFiles = localStorage.getItem('uploadedFiles');
      return savedFiles ? JSON.parse(savedFiles) : [];
    } catch (error) {
      console.error('Error loading files from localStorage:', error);
      return [];
    }
  });
  const [username, setUsername] = useState(() => localStorage.getItem('username') || 'User');
  const [isLoading, setIsLoading] = useState(false);
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [editSessionId, setEditSessionId] = useState(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions to localStorage:', error);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem('uploadedFiles', JSON.stringify(files));
    } catch (error) {
      console.error('Error saving files to localStorage:', error);
    }
  }, [files]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [sessions]);

  const isChineseChar = (char) => {
    const charCode = char.charCodeAt(0);
    return (charCode >= 0x4e00 && charCode <= 0x9fff) ||
        (charCode >= 0x3400 && charCode <= 0x4dbf) ||
        (charCode >= 0x20000 && charCode <= 0x2a6df) ||
        (charCode >= 0x2a700 && charCode <= 0x2b73f) ||
        (charCode >= 0x2b740 && charCode <= 0x2b81f) ||
        (charCode >= 0x2b820 && charCode <= 0x2ceaf);
  };

  const isChinesePunctuation = (char) => {
    const chinesePunctuationRegex = /[\u3000-\u303f\uff00-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/;
    return chinesePunctuationRegex.test(char);
  };

  const handleSendMessage = useCallback(async () => {
    if (message.trim()) {
      const decodedMessage = decodeURIComponent(message.trim());
      console.log("User input:", decodedMessage);
      const updatedSessions = [...sessions];
      const sessionIndex = updatedSessions.findIndex(s => s.id === activeSession);

      if (sessionIndex === -1) {
        console.error('Active session not found');
        return;
      }

      updatedSessions[sessionIndex].messages.push({ sender: username, content: decodedMessage });
      setSessions(updatedSessions);
      setMessage('');
      setIsLoading(true);
      setIsTyping(true);

      try {
        let response;
        if (isRetrievalMode) {
          const params = new URLSearchParams({
            prompt: decodedMessage,
            files: files.map(f => f.name).join(','),
            sessionId: activeSession
          });
          response = await ChatWithFileAPI(params);
        } else {
          const params = {
            prompt: decodedMessage,
            sessionId: activeSession
          };
          response = await FluxMessageWithHistoryAPI(params);
        }

        const sseData = response.data;
        const lines = sseData.split('\n');
        let aiResponse = '';
        let currentLine = '';
        let isChineseResponse = false;

        updatedSessions[sessionIndex].messages.push({ sender: 'AI', content: '' });
        setSessions([...updatedSessions]);

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const messagePart = line.replace('data:', '').trim();
            if (messagePart === '') {
              // Empty data, treat as a new line
              aiResponse += currentLine + '\n';
              currentLine = '';
            } else {
              if (currentLine === '' && isChineseChar(messagePart[0])) {
                isChineseResponse = true;
              }

              if (isChineseResponse) {
                // For Chinese, add characters directly and start a new line after punctuation
                for (const char of messagePart) {
                  currentLine += char;
                  if (isChinesePunctuation(char)) {
                    aiResponse += currentLine + '\n';
                    currentLine = '';
                  }
                }
              } else {
                // For English, add space before the new word, unless it's the first word in the line
                currentLine += (currentLine ? ' ' : '') + messagePart;
              }
            }
            updatedSessions[sessionIndex].messages[updatedSessions[sessionIndex].messages.length - 1] = {
              sender: 'AI',
              content: aiResponse + currentLine
            };
            setSessions([...updatedSessions]);
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        // Add the last line if it's not empty
        if (currentLine) {
          aiResponse += currentLine;
          updatedSessions[sessionIndex].messages[updatedSessions[sessionIndex].messages.length - 1] = {
            sender: 'AI',
            content: aiResponse
          };
          setSessions([...updatedSessions]);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        updatedSessions[sessionIndex].messages.push({ sender: 'AI', content: 'Sorry, there was an error processing your request.' });
        setSessions([...updatedSessions]);
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    }
  }, [message, sessions, activeSession, isRetrievalMode, files, username]);

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const response = await UploadFileAPI(formData);
        if (response.status === 200) {
          const fileMetadata = {
            name: selectedFile.name,
            lastModified: selectedFile.lastModified,
            size: selectedFile.size,
            type: selectedFile.type
          };
          setFiles(prev => [...prev, fileMetadata]);
        } else {
          throw new Error('File upload failed');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        // You might want to show an error message to the user here
      } finally {
        setIsLoading(false);
      }
    }
  };

  const addNewSession = () => {
    setNewSessionDialogOpen(true);
  };

  const handleNewSessionConfirm = () => {
    const newSession = { id: uuidv4(), name: newSessionName || `New Chat ${sessions.length + 1}`, messages: [] };
    setSessions(prev => [...prev, newSession]);
    setActiveSession(newSession.id);
    setNewSessionDialogOpen(false);
    setNewSessionName('');
  };

  const deleteSession = (id) => {
    if (sessions.length > 1) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSession === id) {
        setActiveSession(sessions.find(s => s.id !== id)?.id);
      }
    }
  };

  const startEditSession = (id) => {
    setEditSessionId(id);
    setNewSessionName(sessions.find(s => s.id === id)?.name || '');
  };

  const handleEditSessionConfirm = () => {
    setSessions(prev => prev.map(s =>
        s.id === editSessionId ? { ...s, name: newSessionName } : s
    ));
    setEditSessionId(null);
    setNewSessionName('');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleRetry = async () => {
    const sessionIndex = sessions.findIndex(s => s.id === activeSession);
    if (sessionIndex === -1) return;

    const lastUserMessage = [...sessions[sessionIndex].messages].reverse().find(m => m.sender === username);
    if (!lastUserMessage) return;

    // Remove the last AI message
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex].messages.pop();
    setSessions(updatedSessions);

    // Resend the last user message
    setMessage(lastUserMessage.content);
    await handleSendMessage();
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      // You might want to show a success message here
      console.log('Content copied to clipboard');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleDownload = (content) => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "ai_response.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderMessage = (content, sender) => {
    const MarkdownComponents = {
      p: ({ node, ...props }) => <Typography variant="body1" paragraph sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }} {...props} />,
      h1: ({ node, ...props }) => <Typography variant="h4" gutterBottom sx={{ wordBreak: 'break-word', mt: 4, mb: 2 }} {...props} />,
      h2: ({ node, ...props }) => <Typography variant="h5" gutterBottom sx={{ wordBreak: 'break-word', mt: 3, mb: 2 }} {...props} />,
      h3: ({ node, ...props }) => <Typography variant="h6" gutterBottom sx={{ wordBreak: 'break-word', mt: 2, mb: 1 }} {...props} />,
      h4: ({ node, ...props }) => <Typography variant="subtitle1" gutterBottom sx={{ wordBreak: 'break-word', fontWeight: 'bold' }} {...props} />,
      h5: ({ node, ...props }) => <Typography variant="subtitle2" gutterBottom sx={{ wordBreak: 'break-word', fontWeight: 'bold' }} {...props} />,
      h6: ({ node, ...props }) => <Typography variant="subtitle2" gutterBottom sx={{ wordBreak: 'break-word', fontStyle: 'italic' }} {...props} />,
      ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', marginBottom: '16px' }} {...props} />,
      ol: ({ node, ...props }) => <ol style={{ paddingLeft: '20px', marginBottom: '16px' }} {...props} />,
      li: ({ node, ...props }) => <li style={{ marginBottom: '8px' }} {...props} />,
      code: ({ node, inline, ...props }) =>
          inline ? (
              <code style={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), padding: '2px 4px', borderRadius: '4px', wordBreak: 'break-word' }} {...props} />
          ) : (
              <pre style={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), padding: '16px', borderRadius: '4px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            <code {...props} />
          </pre>
          ),
      strong: ({ node, ...props }) => <strong style={{ fontWeight: 'bold' }} {...props} />,
    };

    if (sender === 'AI') {
      // Process AI response
      const processedContent = content
          .split('\n')
          .map(line => line.trim())
          .join('\n')
          .replace(/\n{3,}/g, '\n\n'); // Replace 3 or more consecutive newlines with 2

      return (
          <>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={MarkdownComponents}
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
      // For user messages, maintain existing behavior
      return (
          <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.primary,
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
      <Box sx={{ display: 'flex', height: '95vh', overflow: 'hidden' }}>
        <Box sx={{
          width: sidebarOpen ? 240 : 0,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}>
          <Paper
              elevation={0}
              sx={{
                height: '100%',
                overflow: 'auto',
                borderRadius: 0,
                borderRight: 1,
                borderColor: 'divider',
              }}
          >
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Chat Sessions</Typography>
            </Box>
            <List sx={{ flexGrow: 1 }}>
              <AnimatePresence>
                {sessions.map((session) => (
                    <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                      <ListItem
                          button
                          selected={session.id === activeSession}
                          onClick={() => setActiveSession(session.id)}
                          sx={{
                            borderRadius: 1,
                            my: 0.5,
                            mx: 1,
                            '&.Mui-selected': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                              }
                            }
                          }}
                      >
                        <ListItemIcon>
                          <ChatIcon color={session.id === activeSession ? 'primary' : 'inherit'} />
                        </ListItemIcon>
                        {editSessionId === session.id ? (
                            <TextField
                                value={newSessionName}
                                onChange={(e) => setNewSessionName(e.target.value)}
                                onBlur={handleEditSessionConfirm}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleEditSessionConfirm();
                                  }
                                }}
                                autoFocus
                                size="small"
                                sx={{ flexGrow: 1 }}
                            />
                        ) : (
                            <ListItemText primary={session.name} />
                        )}
                        <IconButton edge="end" onClick={() => startEditSession(session.id)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {sessions.length > 1 && (
                            <IconButton edge="end" onClick={() => deleteSession(session.id)} size="small">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                      </ListItem>
                    </motion.div>
                ))}
              </AnimatePresence>
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addNewSession}
                  sx={{ borderRadius: 2 }}
              >
                New Chat
              </Button>
            </Box>
            {isRetrievalMode && (
                <>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Uploaded Files</Typography>
                    <List dense>
                      {files.map((file, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <FileIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary={file.name}
                                secondary={`${(file.size / 1024).toFixed(2)} KB`}
                                primaryTypographyProps={{ variant: 'body2' }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                      ))}
                    </List>
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                    />
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        sx={{ mt: 1, borderRadius: 2 }}
                    >
                      Upload File
                    </Button>
                  </Box>
                </>
            )}
          </Paper>
        </Box>
        <Box sx={{
          flexGrow: 1,
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={toggleSidebar} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold' }}>
                {sessions.find(s => s.id === activeSession)?.name || 'Chat'}
              </Typography>
            </Box>
            <FormControlLabel
                control={
                  <Switch
                      checked={isRetrievalMode}
                      onChange={(e) => {
                        setIsRetrievalMode(e.target.checked);
                        if (!e.target.checked) {
                          setFiles([]);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }
                      }}
                  />
                }
                label="Retrieval Mode"
            />
          </Box>
          <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 1.5 }}>
            <Card sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: theme.shadows[4],
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 2 }} ref={chatContainerRef}>
                <AnimatePresence>
                  {sessions.find(s => s.id === activeSession)?.messages.map((msg, index) => (
                      <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                      >
                        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: msg.sender === username ? 'flex-end' : 'flex-start' }}>
                          <Paper elevation={1} sx={{
                            maxWidth: '70%',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: msg.sender === username
                                ? alpha(theme.palette.primary.main, 0.1)
                                : theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.background.paper, 0.2)
                                    : '#f7f7f8',
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
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
              </CardContent>
              <Divider />
              <Box sx={{ p: 1.5 }}>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type your message here"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        multiline
                        maxRows={3}
                        disabled={isLoading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
                            },
                          },
                        }}
                    />
                  </Grid>
                  <Grid item>
                    <Tooltip title={isLoading ? "Processing..." : "Send message"}>
                    <span>
                      <Button
                          variant="contained"
                          endIcon={<SendIcon />}
                          onClick={handleSendMessage}
                          disabled={isLoading || (isRetrievalMode && files.length === 0) || !message.trim()}
                          sx={{
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            transition: 'all 0.3s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: theme.shadows[4],
                            },
                          }}
                      >
                        Send
                      </Button>
                    </span>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Box>
        </Box>

        <Dialog
            open={newSessionDialogOpen}
            onClose={() => setNewSessionDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: theme.shadows[5],
              },
            }}
        >
          <DialogTitle>Create New Chat Session</DialogTitle>
          <DialogContent>
            <TextField
                autoFocus
                margin="dense"
                label="Session Name"
                type="text"
                fullWidth
                variant="outlined"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
                    },
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
                    },
                  },
                }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewSessionDialogOpen(false)} sx={{ borderRadius: 1 }}>Cancel</Button>
            <Button onClick={handleNewSessionConfirm} variant="contained" sx={{ borderRadius: 1 }}>Create</Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}