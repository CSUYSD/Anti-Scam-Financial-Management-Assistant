import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { styled, createTheme, ThemeProvider } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Box,
    CssBaseline,
    Drawer as MuiDrawer,
    IconButton,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Paper,
    Tooltip,
    Avatar,
} from '@mui/material'
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    Settings as SettingsIcon,
    Brightness4 as Brightness4Icon,
    Brightness7 as Brightness7Icon,
    Logout as LogoutIcon,
    Chat as ChatIcon,
    Send as SendIcon,
    Close as CloseIcon,
    AccountCircle as AccountCircleIcon,
} from '@mui/icons-material'
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { mainListItems, secondaryListItems } from './ListItems'
import { logoutAPI } from '@/api/user'
import { removeToken } from "@/utils/index"
import { useChatSessions } from '@/hooks/useChatSessions'
import { FluxMessageWithHistoryAPI } from '@/api/ai'
import { formatMessageContent } from '@/utils/messageFormatter'
import WebSocketService from "@/service/WebSocketService.js"

const drawerWidth = 240

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
)

const ChatButton = styled(motion.div)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    zIndex: 1000,
}))

const ChatWindow = styled(motion.div)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(12),
    right: theme.spacing(4),
    width: 350,
    height: 500,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadius * 2,
    overflow: 'hidden',
    boxShadow: theme.shadows[10],
}))

export default function DashboardLayout() {
    const [open, setOpen] = useState(true)
    //const [mode, setMode] = useState('light') //Removed
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
    const [chatOpen, setChatOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const {
        sessions,
        activeSession,
        setActiveSession,
        addNewSession,
        addMessageToActiveSession,
        updateMessageInActiveSession,
    } = useChatSessions()
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [username, setUsername] = useState(() => localStorage.getItem('username') || 'User')

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    primary: {
                        main: '#3f51b5',
                        light: '#757de8',
                        dark: '#002984',
                    },
                    secondary: {
                        main: '#f50057',
                        light: '#ff4081',
                        dark: '#c51162',
                    },
                    background: {
                        default: '#f5f5f5',
                        paper: '#ffffff',
                    },
                },
                components: {
                    MuiDrawer: {
                        styleOverrides: {
                            paper: {
                                backgroundColor: '#3f51b5',
                                color: '#ffffff',
                            },
                        },
                    },
                    MuiListItemIcon: {
                        styleOverrides: {
                            root: {
                                color: 'rgba(255, 255, 255, 0.7)',
                            },
                        },
                    },
                    MuiListItemText: {
                        styleOverrides: {
                            primary: {
                                color: '#ffffff',
                            },
                        },
                    },
                    MuiDivider: {
                        styleOverrides: {
                            root: {
                                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                            },
                        },
                    },
                },
            }),
        []
    )

    const toggleDrawer = () => {
        setOpen(!open)
    }

    const getPageTitle = (path) => {
        if (path === "/") {
            return "Dashboard"
        }
        return path.substring(1).charAt(0).toUpperCase() + path.slice(2)
    }


    const handleLogout = () => {
        setLogoutDialogOpen(true)
    }

    const handleLogoutConfirm = async () => {
        setLogoutDialogOpen(false)
        try {
            await logoutAPI()
            removeToken()
            localStorage.removeItem('username')
            localStorage.removeItem('chatSessions')
            localStorage.removeItem('uploadedFiles')
            WebSocketService.handleLogout()
            navigate('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const handleLogoutCancel = () => {
        setLogoutDialogOpen(false)
    }

    const handleAccountClick = () => {
        navigate('/account')
    }

    const handleUserProfileClick = () => {
        navigate('/userprofile')
    }

    const toggleChat = () => {
        setChatOpen(!chatOpen)
        if (!chatOpen) {
            const newSessionId = addNewSession()
            setActiveSession(newSessionId)
        }
    }

    const handleSendMessage = useCallback(async () => {
        if (message.trim()) {
            const timestamp = new Date().toISOString()
            const userMessage = { sender: username, content: message.trim(), timestamp }
            addMessageToActiveSession(userMessage)

            setMessage('')
            setIsLoading(true)
            setIsTyping(true)

            try {
                const params = {
                    prompt: message.trim(),
                    sessionId: activeSession,
                }
                const response = await FluxMessageWithHistoryAPI(params)

                const aiTimestamp = new Date().toISOString()
                const messageId = addMessageToActiveSession({ sender: 'AI', content: '', timestamp: aiTimestamp })

                let aiResponse = ''
                for (const chunk of response) {
                    aiResponse += chunk
                    updateMessageInActiveSession(messageId, { content: aiResponse })
                    await new Promise(resolve => setTimeout(resolve, 20))
                }
            } catch (error) {
                console.error('Error sending message:', error)
                const errorTimestamp = new Date().toISOString()
                addMessageToActiveSession({
                    sender: 'AI',
                    content: 'Sorry, there was an error processing your request.',
                    timestamp: errorTimestamp
                })
            } finally {
                setIsLoading(false)
                setIsTyping(false)
            }
        }
    }, [message, activeSession, username, addMessageToActiveSession, updateMessageInActiveSession])

    useEffect(() => {
        if (location.pathname === '/report') {
            setChatOpen(false)
        }
    }, [location.pathname])

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <CssBaseline />
                <Drawer variant="permanent" open={open}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: theme.spacing(2),
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            color: 'white',
                        }}
                    >
                        {open && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <img src="/public/logo.png" alt="Logo" style={{ height: '40px', marginRight: theme.spacing(2) }} />
                            </Box>
                        )}
                        <IconButton onClick={toggleDrawer} sx={{ color: 'white' }}>
                            {open ? <ChevronLeftIcon /> : <MenuIcon />}
                        </IconButton>
                    </Box>
                    <Divider />
                    <List component="nav">
                        {mainListItems}
                        <Divider sx={{ my: 1 }} />
                        {secondaryListItems}
                        <Divider sx={{ my: 1 }} />
                        <ListItem button onClick={handleUserProfileClick}>
                            <ListItemIcon>
                                <Avatar sx={{ width: 24, height: 24, bgcolor: theme.palette.secondary.main }}>
                                    {username.charAt(0).toUpperCase()}
                                </Avatar>
                            </ListItemIcon>
                            <ListItemText primary="User Profile" />
                        </ListItem>
                        <ListItem button onClick={handleAccountClick}>
                            <ListItemIcon>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText primary="Account Settings" />
                        </ListItem>
                    </List>
                    <Box sx={{ mt: 'auto', p: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                        >
                            Logout
                        </Button>
                    </Box>
                </Drawer>
                <Box
                    component="main"
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'light'
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        flexGrow: 1,
                        height: '100vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Outlet />
                        </motion.div>
                    </Box>
                </Box>
            </Box>
            <Dialog
                open={logoutDialogOpen}
                onClose={handleLogoutCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{
                    component: motion.div,
                    initial: { opacity: 0, scale: 0.9 },
                    animate: { opacity: 1, scale: 1 },
                    exit: { opacity: 0, scale: 0.9 },
                }}
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Logout"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to log out?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleLogoutCancel}>Cancel</Button>
                    <Button onClick={handleLogoutConfirm} autoFocus>
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
            {location.pathname !== '/report' && (
                <ChatButton
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleChat}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25  }}
                >
                    <IconButton
                        color="primary"
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: theme.shadows[4],
                            '&:hover': {
                                backgroundColor: theme.palette.background.paper,
                            },
                            width: 56,
                            height: 56,
                        }}
                    >
                        <ChatIcon />
                    </IconButton>
                </ChatButton>
            )}
            <AnimatePresence>
                {chatOpen && (
                    <ChatWindow
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.3 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>AI Assistant</Typography>
                            <IconButton onClick={toggleChat} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default' }}>
                            {sessions.find(s => s.id === activeSession)?.messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity:  0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: message.sender === username ? 'flex-end' : 'flex-start' }}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                maxWidth: '80%',
                                                borderRadius: 2,
                                                bgcolor: message.sender === username ? 'primary.main' : 'background.paper',
                                                color: message.sender === username ? 'primary.contrastText' : 'text.primary',
                                            }}
                                        >
                                            <Typography variant="body2">{message.content}</Typography>
                                        </Paper>
                                        <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </Typography>
                                    </Box>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
                                        <Paper elevation={0} sx={{ p: 2, maxWidth: '80%', borderRadius: 2, bgcolor: 'background.paper' }}>
                                            <Typography variant="body2">AI is typing...</Typography>
                                        </Paper>
                                    </Box>
                                </motion.div>
                            )}
                        </Box>
                        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={isLoading}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton type="submit" disabled={isLoading || !message.trim()}>
                                            <SendIcon />
                                        </IconButton>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 4,
                                        '&.Mui-focused': {
                                            boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </ChatWindow>
                )}
            </AnimatePresence>
        </ThemeProvider>
    )
}