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
  Paper,
  Chip,
  Avatar,
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
  Person as PersonIcon,
  SmartToy as AIIcon,
  Menu as MenuIcon,
} from '@mui/icons-material'
import { v4 as uuidv4 } from 'uuid'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import {
  MessageAPI,
  FluxMessageAPI,
  FluxMessageWithHistoryAPI,
  ChatWithFileAPI,
  UploadFileAPI
} from '@/api/ai'

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
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || 'User'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
  const [editSessionId, setEditSessionId] = useState(null)
  const fileInputRef = useRef(null)
  const chatContainerRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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

        updatedSessions[sessionIndex].messages.push({ sender: 'AI', content: '' });
        setSessions([...updatedSessions]);

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const messagePart = line.replace('data:', '').trim();
            for (const char of messagePart) {
              aiResponse += char;
              updatedSessions[sessionIndex].messages[updatedSessions[sessionIndex].messages.length - 1] = {
                sender: 'AI',
                content: aiResponse.replace(/\\n/g, '\n').replace(/\\s/g, ' ')
              };
              setSessions([...updatedSessions]);
              await new Promise(resolve => setTimeout(resolve, 50));
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

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setIsLoading(true)
      try {
        const formData = new FormData()
        formData.append('file', selectedFile)
        const response = await UploadFileAPI(formData)
        if (response.status === 200) {
          const fileMetadata = {
            name: selectedFile.name,
            lastModified: selectedFile.lastModified,
            size: selectedFile.size,
            type: selectedFile.type
          }
          setFiles(prev => [...prev, fileMetadata])
        } else {
          throw new Error('File upload failed')
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        // You might want to show an error message to the user here
      } finally {
        setIsLoading(false)
      }
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
      <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden', bgcolor: 'background.default' }}>
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
                bgcolor: 'background.paper',
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
                                    handleEditSessionConfirm()
                                  }
                                }}
                                autoFocus
                                size="small"
                                sx={{ flexGrow: 1 }}
                            />
                        ) : (
                            <ListItemText primary={session.name} />
                        )}
                        {session.id !== sessions[0].id && (
                            <>
                              <IconButton edge="end" onClick={() => startEditSession(session.id)} size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton edge="end" onClick={() => deleteSession(session.id)} size="small">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
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
                        onClick={() => fileInputRef.current.click()}
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
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={toggleSidebar} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                {sessions.find(s => s.id === activeSession)?.name}
              </Typography>
            </Box>
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
          <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 2 }}>
            <Card sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              boxShadow: theme.shadows[4],
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 3 }} ref={chatContainerRef}>
                <AnimatePresence>
                  {sessions.find(s => s.id === activeSession)?.messages.map((msg, index) => (
                      <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                      >
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: msg.sender === 'User' ? 'flex-end' : 'flex-start' }}>
                          <Paper elevation={1} sx={{
                            maxWidth: '70%',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: msg.sender === 'User' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.secondary.main, 0.1),
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: msg.sender === username ? 'primary.main' : 'secondary.main' }}>
                                {msg.sender === username ? <PersonIcon fontSize="small" /> : <AIIcon fontSize="small" />}
                              </Avatar>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {msg.sender === username ? username : 'User'}
                              </Typography>
                            </Box>
                            {msg.sender === 'AI' ? (
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            ) : (
                                <Typography variant="body1" sx={{
                                  color: theme.palette.text.primary,
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {msg.content}
                                </Typography>
                            )}
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
                          sx={{ animation: 'pulse 1.5s infinite' }}
                      />
                    </Box>
                )}
              </CardContent>
              <Divider />
              <Box sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
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
            </Card>
          </Box>
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Generate Reports</Typography>
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
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4],
                          },
                          borderRadius: 2,
                          py: 1.5,
                          transition: 'all 0.3s',
                        }}
                    >
                      {report.type}
                    </Button>
                  </Grid>
              ))}
            </Grid>
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
  )
}