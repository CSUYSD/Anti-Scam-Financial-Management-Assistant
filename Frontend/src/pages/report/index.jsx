import React, { useState, useRef, useCallback } from 'react';
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
  IconButton,
  useTheme,
  alpha,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Sidebar } from '@/components/Sidebar';
import { ChatMessages } from '@/components/ChatMessages';
import { FluxMessageWithHistoryAPI, ChatWithFileAPI } from '@/api/ai';

const drawerWidth = 240;

export default function ChatInterface() {
  const theme = useTheme();
  const {
    sessions,
    activeSession,
    setActiveSession,
    addNewSession,
    deleteSession,
    updateSessionName,
    addMessageToActiveSession,
  } = useChatSessions();
  const { files, uploadFile, clearFiles } = useFileUpload();

  const [message, setMessage] = useState('');
  const [isRetrievalMode, setIsRetrievalMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [editSessionId, setEditSessionId] = useState(null);
  const fileInputRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [username, setUsername] = useState(() => localStorage.getItem('username') || 'User');

  const handleSendMessage = useCallback(async () => {
    if (message.trim()) {
      const decodedMessage = decodeURIComponent(message.trim());
      console.log("User input:", decodedMessage);

      addMessageToActiveSession({ sender: username, content: decodedMessage });
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

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const messagePart = line.replace('data:', '').trim();
            aiResponse += messagePart;
            addMessageToActiveSession({ sender: 'AI', content: aiResponse });
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        addMessageToActiveSession({ sender: 'AI', content: 'Sorry, there was an error processing your request.' });
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    }
  }, [message, activeSession, isRetrievalMode, files, username, addMessageToActiveSession]);

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setIsLoading(true);
      try {
        await uploadFile(selectedFile);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNewSessionConfirm = () => {
    addNewSession(newSessionName);
    setNewSessionDialogOpen(false);
    setNewSessionName('');
  };

  const startEditSession = (id) => {
    setEditSessionId(id);
    setNewSessionName(sessions.find(s => s.id === id)?.name || '');
  };

  const handleEditSessionConfirm = () => {
    if (editSessionId) {
      updateSessionName(editSessionId, newSessionName);
      setEditSessionId(null);
      setNewSessionName('');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleRetry = async () => {
    const currentSession = sessions.find(s => s.id === activeSession);
    if (!currentSession) return;

    const lastUserMessage = [...currentSession.messages].reverse().find(m => m.sender === username);
    if (!lastUserMessage) return;

    // Remove the last AI message
    const updatedMessages = currentSession.messages.slice(0, -1);
    updateSessionName(activeSession, currentSession.name);

    // Resend the last user message
    setMessage(lastUserMessage.content);
    await handleSendMessage();
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content).then(() => {
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

  return (
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Box sx={{
          width: sidebarOpen ? drawerWidth : 0,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}>
          <Sidebar
              sessions={sessions}
              activeSession={activeSession}
              setActiveSession={setActiveSession}
              addNewSession={() => setNewSessionDialogOpen(true)}
              deleteSession={deleteSession}
              startEditSession={startEditSession}
              editSessionId={editSessionId}
              newSessionName={newSessionName}
              setNewSessionName={setNewSessionName}
              handleEditSessionConfirm={handleEditSessionConfirm}
              isRetrievalMode={isRetrievalMode}
              files={files}
              handleFileUpload={handleFileUpload}
              fileInputRef={fileInputRef}
              isLoading={isLoading}
          />
        </Box>
        <Box sx={{
          flexGrow: 1,
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={toggleSidebar} sx={{ mr: 2 }}>
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
                          clearFiles();
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }
                      }}
                  />
                }
                label="Retrieval Mode"
            />
          </Box>
          <Card sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: theme.shadows[4],
            borderRadius: 2,
            overflow: 'hidden',
            m: 2,
          }}>
            <CardContent sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 0 }}>
              <ChatMessages
                  messages={sessions.find(s => s.id === activeSession)?.messages || []}
                  username={username}
                  isTyping={isTyping}
                  handleRetry={handleRetry}
                  handleCopy={handleCopy}
                  handleDownload={handleDownload}
              />
              <Divider />
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
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
                        maxRows={4}
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
                            px: 3,
                            py: 1.5,
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
            </CardContent>
          </Card>
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