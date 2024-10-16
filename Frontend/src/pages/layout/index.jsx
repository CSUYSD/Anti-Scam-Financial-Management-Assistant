import React, { useState, useCallback, useMemo } from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AppBar as MuiAppBar,
    Drawer as MuiDrawer,
    Box,
    CssBaseline,
    Toolbar,
    IconButton,
    Typography,
    Divider,
    List,
    Badge,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Paper,
    Tooltip,
    Link as MuiLink,
    Avatar,
} from '@mui/material';
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    AccountCircle as AccountCircleIcon,
    Settings as SettingsIcon,
    Brightness4 as Brightness4Icon,
    Brightness7 as Brightness7Icon,
    Logout as LogoutIcon,
    Chat as ChatIcon,
    Send as SendIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { mainListItems, secondaryListItems } from './ListItems';
import { logoutAPI } from '@/api/user';
import { removeToken } from "@/utils/index";
// @ts-ignore
import { useChatSessions } from '@/hooks/useChatSessions';
import { FluxMessageWithHistoryAPI } from '@/api/ai';
import { formatMessageContent } from '@/utils/messageFormatter';
import WebSocketService from "@/service/WebSocketService.js";


const drawerWidth = 240;


const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    background: 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
    boxShadow: 'none',
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));


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
);


const ChatButton = styled(motion.div)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    zIndex: 1000,
}));


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
}));



export default function Component() {
    const [open, setOpen] = useState(true);
    const [mode, setMode] = useState('light');
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const {
        sessions,
        activeSession,
        addMessageToActiveSession,
        updateMessageInActiveSession,
    } = useChatSessions();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [username, setUsername] = useState(() => localStorage.getItem('username') || 'User');


    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                            primary: {
                                main: '#1976D2',
                                light: '#42A5F5',
                            },
                            background: {
                                default: '#f5f7fa',
                                paper: '#ffffff',
                            },
                        }
                        : {
                            primary: {
                                main: '#90CAF9',
                                light: '#BBDEFB',
                            },
                            background: {
                                default: '#121212',
                                paper: '#1e1e1e',
                            },
                        }),
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                                boxShadow: mode === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                            },
                        },
                    },
                    MuiListItemIcon: {
                        styleOverrides: {
                            root: {
                                color: mode === 'dark' ? '#90CAF9' : '#1976D2',
                            },
                        },
                    },
                },
            }),
        [mode],
    );


    const toggleDrawer = () => {
        setOpen(!open);
    };


    const getPageTitle = (path) => {
        if (path === "/") {
            return "Dashboard";
        }
        return path.substring(1).charAt(0).toUpperCase() + path.slice(2);
    };


    const toggleColorMode = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };


    const handleLogout = () => {
        setLogoutDialogOpen(true);
    };


    const handleLogoutConfirm = async () => {
        setLogoutDialogOpen(false);
        try {
            await logoutAPI();
            removeToken();
            localStorage.removeItem('username');
            localStorage.removeItem('chatSessions');
            localStorage.removeItem('uploadedFiles');
            WebSocketService.handleLogout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };


    const handleLogoutCancel = () => {
        setLogoutDialogOpen(false);
    };


    const handleAccountClick = () => {
        navigate('/account');
    };


    const handleUserProfileClick = () => {
        navigate('/userprofile');
    };


    const toggleChat = () => {
        setChatOpen(!chatOpen);
    };


    const handleSendMessage = useCallback(async () => {
        if (message.trim()) {
            const decodedMessage = decodeURIComponent(message.trim());
            console.log("User input:", decodedMessage);


            addMessageToActiveSession({ sender: username, content: decodedMessage });


            setMessage('');
            setIsLoading(true);
            setIsTyping(true);


            try {
                const params = {
                    prompt: decodedMessage,
                    sessionId: activeSession,
                };
                const response = await FluxMessageWithHistoryAPI(params);


                const sseData = response.data;
                const lines = sseData.split('\n');
                let aiResponse = '';


                const messageId = addMessageToActiveSession({ sender: 'AI', content: '' });


                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const messagePart = line.replace('data:', '').trim();
                        if (messagePart) {
                            aiResponse = formatMessageContent(aiResponse, messagePart);
                            updateMessageInActiveSession(messageId, { content: aiResponse });
                            await new Promise(resolve => setTimeout(resolve, 20));
                        }
                    }
                }
            } catch (error) {
                console.error('Error sending message:', error);
                updateMessageInActiveSession(messageId, { content: 'Sorry, there was an error processing your request.' });
            } finally {
                setIsLoading(false);
                setIsTyping(false);
            }
        }
    }, [message, activeSession, username, addMessageToActiveSession, updateMessageInActiveSession]);


    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <CssBaseline />
                <AppBar position="absolute" open={open}>
                    <Toolbar sx={{ pr: '24px' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
                            {getPageTitle(location.pathname)}
                        </Typography>
                        <IconButton color="inherit" onClick={toggleColorMode}>
                            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                        <IconButton color="inherit" onClick={handleAccountClick} aria-label="account settings">
                            <SettingsIcon />
                        </IconButton>
                        <IconButton color="inherit" onClick={handleUserProfileClick} aria-label="user profile">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                                {username.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open}>
                    <Toolbar
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: [1],
                            background: 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
                        }}
                    >
                        {open && (
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                <img src="/public/logo.png" alt="Logo" style={{ height: '40px' }} />
                            </Box>
                        )}
                        <IconButton onClick={toggleDrawer} sx={{ color: 'white' }}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List component="nav">
                        {mainListItems}
                        <Divider sx={{ my: 1 }} />
                        {secondaryListItems}
                    </List>
                    <Box sx={{ mt: 'auto', p: 2 }}>
                        <Tooltip title="Logout" placement="right">
                            <IconButton
                                color="primary"
                                onClick={handleLogout}
                                sx={{
                                    width: '100%',
                                    justifyContent: open ? 'flex-start' : 'center',
                                    '& .MuiButton-startIcon': {
                                        mr: open ? 1 : 'auto',
                                    },
                                }}
                            >
                                <LogoutIcon />
                                {open && (
                                    <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                                        Logout
                                    </Typography>
                                )}
                            </IconButton>
                        </Tooltip>
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
                    <Toolbar />
                    <Box sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
                        <Outlet />
                    </Box>
                </Box>
            </Box>
            <Dialog
                open={logoutDialogOpen}
                onClose={handleLogoutCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
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
            <ChatButton
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleChat}
            >
                <IconButton
                    color="primary"
                    sx={{
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.shadows[4],
                        '&:hover': {
                            backgroundColor:  theme.palette.background.paper,
                        },
                    }}
                >
                    <ChatIcon />
                </IconButton>
            </ChatButton>
            <AnimatePresence>
                {chatOpen && (
                    <ChatWindow
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.3 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    >
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems:  'center', bgcolor: 'background.paper' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>AI Assistant</Typography>
                            <IconButton onClick={toggleChat} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default' }}>
                            {sessions.find(s => s.id === activeSession)?.messages.map((message, index) => (
                                <Box key={index} sx={{ mb: 2, display: 'flex', justifyContent: message.sender === username ? 'flex-end' : 'flex-start' }}>
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
                                </Box>
                            ))}
                            {isTyping && (
                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
                                    <Paper elevation={0} sx={{ p: 2, maxWidth: '80%', borderRadius: 2, bgcolor: 'background.paper' }}>
                                        <Typography variant="body2">AI is typing...</Typography>
                                    </Paper>
                                </Box>
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
    );
}



