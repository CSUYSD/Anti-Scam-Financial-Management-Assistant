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
    Logout as LogoutIcon,
    Chat as ChatIcon,
    Send as SendIcon,
    Close as CloseIcon,
} from '@mui/icons-material'
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { mainListItems, secondaryListItems } from './ListItems'
import { logoutAPI } from '@/api/user'
import { removeToken } from "@/utils/index"
import { useChatSessions } from '@/hooks/useChatSessions'
import { FluxMessageWithHistoryAPI } from '@/api/ai'
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
                    mode: 'light',
                    primary: {
                        main: 'rgba(59, 130, 246, 0.8)', // Blue with transparency
                        light: 'rgba(96, 165, 250, 0.9)',
                        dark: 'rgba(37, 99, 235, 0.8)',
                    },
                    secondary: {
                        main: 'rgba(14, 165, 233, 0.8)', // Sky blue with transparency
                        light: 'rgba(56, 189, 248, 0.9)',
                        dark: 'rgba(2, 132, 199, 0.8)',
                    },
                    background: {
                        default: 'rgba(238, 242, 255, 0.8)', // Slightly blue-tinted background
                        paper: 'rgba(248, 250, 252, 0.9)', // Increased opacity for better contrast
                    },
                    text: {
                        primary: 'rgba(15, 23, 42, 0.87)', // Dark blue-gray
                        secondary: 'rgba(51, 65, 85, 0.6)', // Medium blue-gray
                    },
                },
                typography: {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                },
                shape: {
                    borderRadius: 12,
                },
                components: {
                    MuiDrawer: {
                        styleOverrides: {
                            paper: {
                                backgroundColor: 'rgba(248, 250, 252, 0.97)', // Slightly increased opacity
                                backgroundImage: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.06), rgba(14, 165, 233, 0.06))', // Lighter gradient
                                backdropFilter: 'blur(12px)', // Increased blur for more depth
                            },
                        },
                    },
                    MuiListItemIcon: {
                        styleOverrides: {
                            root: {
                                color: 'rgba(59, 130, 246, 0.9)', // Slightly darker and more opaque than the layout's blue
                            },
                        },
                    },
                    MuiListItemText: {
                        styleOverrides: {
                            primary: {
                                color: 'rgba(15, 23, 42, 0.87)',
                                fontWeight: 500,
                                '&.Mui-selected': {
                                    color: 'rgba(59, 130, 246, 0.9)', // Matching the icon color
                                },
                            },
                        },
                    },
                    MuiDivider: {
                        styleOverrides: {
                            root: {
                                borderColor: 'rgba(203, 213, 225, 0.5)',
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                                fontWeight: 600,
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

    const getAvatarColor = (name) => {
        const colors = [
            'rgba(59, 130, 246, 0.9)', 'rgba(14, 165, 233, 0.9)', 'rgba(236, 72, 153, 0.9)',
            'rgba(124, 58, 237, 0.9)', 'rgba(245, 158, 11, 0.9)', 'rgba(6, 182, 212, 0.9)',
            'rgba(16, 185, 129, 0.9)', 'rgba(168, 85, 247, 0.9)', 'rgba(249, 115, 22, 0.9)', 'rgba(234, 88, 12, 0.9)'
        ]
        const index = name.charCodeAt(0) % colors.length
        return colors[index]
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.8) 0%, rgba(248, 250, 252, 0.9) 100%)' }}>
                <CssBaseline />
                <Drawer variant="permanent" open={open}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: theme.spacing(2),
                            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        {open && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <img src="/public/logo.png" alt="Logo" style={{ height: '40px', marginRight: theme.spacing(2) }} />
                            </Box>
                        )}
                        <IconButton onClick={toggleDrawer} sx={{ color: 'text.primary' }}>
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
                                <Avatar sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: getAvatarColor(username),
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}>
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
                            variant="contained"
                            color="primary"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            sx={{
                                color: 'background.paper',
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Drawer>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        height: '100vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(14, 165, 233, 0.05) 25%, rgba(241, 245, 249, 0) 50%)',
                            zIndex: -1
                        }}
                    />
                    <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative', zIndex: 1 }}>
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
                    style: {
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: theme.shape.borderRadius,
                    }
                }}
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Logout"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" sx={{ color: 'text.secondary' }}>
                        Are you sure you want to log out?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleLogoutCancel} color="primary">Cancel</Button>
                    <Button onClick={handleLogoutConfirm} color="primary" variant="contained" autoFocus>
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
                    exit={{ opacity:  0, y: 50 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25  }}
                >
                    <IconButton
                        color="primary"
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Increased opacity
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)', // Slightly stronger shadow
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 1)',
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
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', // Increased opacity
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)', // Slightly stronger shadow
                        }}
                    >
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>AI Assistant</Typography>
                            <IconButton onClick={toggleChat} size="small" sx={{ color: 'text.secondary' }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                            {sessions.find(s => s.id === activeSession)?.messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
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
                                                bgcolor: message.sender === username ? 'primary.light' : 'background.paper',
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
                        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={isLoading}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton type="submit" disabled={isLoading || !message.trim()} color="primary">
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