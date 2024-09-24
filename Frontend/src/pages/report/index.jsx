import React, { useState, useRef, useEffect } from 'react'
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
} from '@mui/icons-material'
import { FluxMessageWithHistoryAPI, UploadFileAPI, ChatWithFileAPI } from '@/api/ai.jsx'
import { v4 as uuidv4 } from 'uuid'

const drawerWidth = 240

export default function Reports() {
    const theme = useTheme()
    const [sessions, setSessions] = useState([{ id: uuidv4(), name: 'New Chat', messages: [] }])
    const [activeSession, setActiveSession] = useState(sessions[0].id)
    const [message, setMessage] = useState('')
    const [isRetrievalMode, setIsRetrievalMode] = useState(false)
    const [files, setFiles] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [newSessionDialogOpen, setNewSessionDialogOpen] = useState(false)
    const [newSessionName, setNewSessionName] = useState('')
    const fileInputRef = useRef(null)
    const chatContainerRef = useRef(null)

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [sessions])

    const handleSendMessage = async () => {
        if (message.trim()) {
            const updatedSessions = [...sessions]
            const sessionIndex = updatedSessions.findIndex(s => s.id === activeSession)
            updatedSessions[sessionIndex].messages.push({ sender: 'User', content: message.trim() })
            setSessions(updatedSessions)
            setMessage('')
            setIsLoading(true)

            try {
                let response
                if (isRetrievalMode && files.length > 0) {
                    response = await ChatWithFileAPI({
                        message: message.trim(),
                        files: files.map(f => f.name),
                        sessionId: activeSession
                    })
                } else {
                    response = await FluxMessageWithHistoryAPI({
                        message: message.trim(),
                        sessionId: activeSession,
                        history: updatedSessions[sessionIndex].messages
                    })
                }

                const reader = response.body.getReader()
                const decoder = new TextDecoder()

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    const chunk = decoder.decode(value)
                    const lines = chunk.split('\n').filter(line => line.trim() !== '')

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const jsonData = JSON.parse(line.slice(6))
                            if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                                const content = jsonData.choices[0].delta.content
                                updatedSessions[sessionIndex].messages = [
                                    ...updatedSessions[sessionIndex].messages.slice(0, -1),
                                    {
                                        sender: 'AI',
                                        content: (updatedSessions[sessionIndex].messages[updatedSessions[sessionIndex].messages.length - 1].sender === 'AI'
                                            ? updatedSessions[sessionIndex].messages[updatedSessions[sessionIndex].messages.length - 1].content
                                            : '') + content
                                    }
                                ]
                                setSessions([...updatedSessions])
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error sending message:', error)
                updatedSessions[sessionIndex].messages.push({ sender: 'AI', content: 'Sorry, there was an error processing your request.' })
                setSessions([...updatedSessions])
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleFileUpload = async (event) => {
        const selectedFile = event.target.files[0]
        if (selectedFile) {
            setIsLoading(true)
            try {
                const formData = new FormData()
                formData.append('file', selectedFile)
                await UploadFileAPI(formData)
                setFiles(prev => [...prev, selectedFile])
            } catch (error) {
                console.error('Error uploading file:', error)
                const updatedSessions = [...sessions]
                const sessionIndex = updatedSessions.findIndex(s => s.id === activeSession)
                updatedSessions[sessionIndex].messages.push({ sender: 'AI', content: 'Sorry, there was an error uploading your file.' })
                setSessions(updatedSessions)
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleGenerateReport = (reportType) => {
        const updatedSessions = [...sessions]
        const sessionIndex = updatedSessions.findIndex(s => s.id === activeSession)
        updatedSessions[sessionIndex].messages.push({ sender: 'AI', content: `Generating ${reportType} report. This may take a moment.` })
        setSessions(updatedSessions)
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

    return (
        <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            <Box
                sx={{
                    width: 300,
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
                            <ListItemText primary={session.name} />
                            {session.id !== sessions[0].id && (
                                <IconButton edge="end" onClick={() => deleteSession(session.id)}>
                                    <DeleteIcon />
                                </IconButton>
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
                                    <ListItemText primary={file.name} />
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
            <Box sx={{ flexGrow: 1, p: 3, height: '100%', overflow: 'auto' }}>
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
                    height: 'calc(100% - 180px)',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    boxShadow: theme.shadows[4],
                }}>
                    <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 3 }} ref={chatContainerRef}>
                        {sessions.find(s => s.id === activeSession)?.messages.map((msg, index) => (
                            <Box key={index} sx={{ mb: 2, display: 'flex', justifyContent: msg.sender === 'User' ? 'flex-end' : 'flex-start' }}>
                                <Typography variant="body1" sx={{
                                    maxWidth: '70%',
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: msg.sender === 'User' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.secondary.main, 0.1),
                                    color: msg.sender === 'User' ? theme.palette.primary.main : theme.palette.secondary.main,
                                }}>
                                    {msg.content}
                                </Typography>
                            </Box>
                        ))}
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
                                    disabled={isLoading}
                                    sx={{ bgcolor: 'background.paper' }}
                                />
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    endIcon={<SendIcon />}
                                    onClick={handleSendMessage}
                                    disabled={isLoading || (isRetrievalMode && files.length === 0)}
                                >
                                    Send
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Card>

                <Box sx={{ mt: 3 }}>
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

            {isLoading && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    zIndex: theme.zIndex.drawer + 2,
                }}>
                    <CircularProgress size={60} />
                </Box>
            )}
        </Box>
    )
}