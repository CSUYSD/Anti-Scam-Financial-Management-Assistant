import React, { useState, useRef, useEffect, useCallback } from 'react'
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
  CircularProgress,
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
  Fade,
  Tooltip,
} from '@mui/material'
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  AccountBalance as AccountBalanceIcon,
  Send as SendIcon,
  Upload as UploadIcon,
  InsertDriveFile as FileIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import { v4 as uuidv4 } from 'uuid'
import {
  MessageAPI,
  FluxMessageAPI,
  FluxMessageWithHistoryAPI,
  ChatWithFileAPI
} from '@/api/ai'

const drawerWidth = 300

export default function Reports() {
  const theme = useTheme()
  const [sessions, setSessions] = useState(() => {
    const savedSessions = localStorage.getItem('chatSessions')
    return savedSessions ? JSON.parse(savedSessions) : [{ id: uuidv4(), name: 'New Chat', messages: [] }]
  })
  const [activeSession, setActiveSession] = useState(sessions[0].id)
  const [message, setMessage] = useState('')
  const [isRetrievalMode, setIsRetrievalMode] = useState(false)
  const [files, setFiles] = useState(() => {
    const savedFiles = localStorage.getItem('uploadedFiles')
    return savedFiles ? JSON.parse(savedFiles) : []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
  const [editSessionId, setEditSessionId] = useState(null)
  const fileInputRef = useRef(null)
  const chatContainerRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    localStorage.setItem('chatSessions', JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    localStorage.setItem('uploadedFiles', JSON.stringify(files))
  }, [files])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [sessions])

  const handleSendMessage = useCallback(async () => {
    if (message.trim()) {
      const decodedMessage = decodeURIComponent(message.trim());
      console.log("User input:", decodedMessage);
      const updatedSessions = [...sessions];
      const sessionIndex = updatedSessions.findIndex(s => s.id === activeSession);
      
      // Immediately add the user's message to the session
      updatedSessions[sessionIndex].messages.push({ sender: 'User', content: decodedMessage });
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

        // Add an initial AI message
        updatedSessions[sessionIndex].messages.push({ sender: 'AI', content: '' });
        setSessions([...updatedSessions]);

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const messagePart = line.replace('data:', '').trim();
            for (const char of messagePart) {
              aiResponse += char;
              // Update the AI's response in real-time
              updatedSessions[sessionIndex].messages[updatedSessions[sessionIndex].messages.length - 1] = {
                sender: 'AI',
                content: aiResponse.replace(/\\n/g, '\n').replace(/\\s/g, ' ')
              };
              setSessions([...updatedSessions]);
              await new Promise(resolve => setTimeout(resolve, 50)); // Control character display speed
            }
          }
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
  }, [message, sessions, activeSession, isRetrievalMode, files]);

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      const fileMetadata = {
        name: selectedFile.name,
        lastModified: selectedFile.lastModified,
        size: selectedFile.size,
        type: selectedFile.type
      }
      setFiles(prev => [...prev, fileMetadata])
    }
  }

  const handleGenerateReport = (reportType) => {
    setMessage(`Generate a ${reportType} report`)
    handleSendMessage()
  }

  const addNewSession = () => {
    setNewSessionDialogOpen(true)
  }

  const handleNewSessionConfirm = () => {
    const newSession = { id: uuidv4(), name: newSessionName || `New Chat ${sessions.length + 1}`, messages: [] }
    setSessions(prev => [...prev, newSession])
    setActiveSession(newSession.id)
    setNewSessionDialogOpen(false)
    setNewSessionName('')
  }

  const deleteSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id))
    if (activeSession === id) {
      setActiveSession(sessions[0].id)
    }
  }

  const startEditSession = (id) => {
    setEditSessionId(id)
    setNewSessionName(sessions.find(s => s.id === id).name)
  }

  const handleEditSessionConfirm = () => {
    setSessions(prev => prev.map(s =>
      s.id === editSessionId ? { ...s, name: newSessionName } : s
    ))
    setEditSessionId(null)
    setNewSessionName('')
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Box
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          height: '100%',
          overflow: 'auto',
        }}
      >
        <List sx={{ flexGrow: 1 }}>
          {sessions.map((session) => (
            <ListItem
              key={session.id}
              button
              selected={session.id === activeSession}
              onClick={() => setActiveSession(session.id)}
              sx={{
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
                      handleEditSessionConfirm()
                    }
                  }}
                  autoFocus
                />
              ) : (
                <ListItemText primary={session.name} />
              )}
              {session.id !== sessions[0].id && (
                <>
                  <IconButton edge="end" onClick={() => startEditSession(session.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => deleteSession(session.id)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addNewSession}
          >
            New Chat
          </Button>
        </Box>
        {isRetrievalMode && (
          <>
            <Divider />
            <List>
              {files.map((file, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <FileIcon />
                  </ListItemIcon>
                  <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(2)} KB`} />
                </ListItem>
              ))}
            </List>
            <Box sx={{ p: 2 }}>
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
                onClick={() => fileInputRef.current.click()}
                disabled={isLoading}
              >
                Upload File
              </Button>
            </Box>
          </>
        )}
      </Box>
      <Box sx={{ flexGrow: 1, p: 3, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {sessions.find(s => s.id === activeSession)?.name}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isRetrievalMode}
                onChange={(e) => {
                  setIsRetrievalMode(e.target.checked)
                  if (!e.target.checked) {
                    setFiles([])
                    if (fileInputRef.current) fileInputRef.current.value = ''
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
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          boxShadow: theme.shadows[4],
          mb: 2,
        }}>
          <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 3 }} ref={chatContainerRef}>
            {sessions.find(s => s.id === activeSession)?.messages.map((msg, index) => (
              <Fade in={true} key={index}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: msg.sender === 'User' ? 'flex-end' : 'flex-start' }}>
                  <Typography variant="body1" sx={{
                    maxWidth: '70%',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: msg.sender === 'User' ? theme.palette.primary.light : theme.palette.secondary.light,
                    color: msg.sender === 'User' ? theme.palette.primary.contrastText : theme.palette.secondary.contrastText,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.content}
                  </Typography>
                </Box>
              </Fade>
            ))}
            {isTyping && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: theme.palette.text.secondary }}>
                  AI is typing...
                </Typography>
              </Box>
            )}
          </CardContent>
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.9) }}>
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
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  multiline
                  maxRows={4}
                  disabled={isLoading}
                  sx={{ bgcolor: 'background.paper' }}
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
                    >
                      Send
                    </Button>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          </Box>
        </Card>

        <Box>
          <Typography variant="h6" gutterBottom>Generate Reports</Typography>
          <Grid container spacing={2}>
            {[
              { type: 'Income Statement', icon: <BarChartIcon /> },
              { type: 'Balance Sheet', icon: <PieChartIcon /> },
              { type: 'Cash Flow', icon: <AccountBalanceIcon /> },
            ].map((report) => (
              <Grid item xs={12} sm={4} key={report.type}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={report.icon}
                  onClick={() => handleGenerateReport(report.type)}
                  disabled={isLoading}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.9),
                    '&:hover': {
                      bgcolor: theme.palette.primary.main,
                    }
                  }}
                >
                  {report.type}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <Dialog open={newSessionDialogOpen} onClose={() => setNewSessionDialogOpen(false)}>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewSessionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleNewSessionConfirm} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}