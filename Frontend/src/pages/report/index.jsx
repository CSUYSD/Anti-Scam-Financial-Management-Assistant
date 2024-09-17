import React, { useState } from 'react'
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Grid,
    useTheme,
    IconButton,
    Fade,
} from '@mui/material'
import {
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    Download as DownloadIcon,
    Send as SendIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

const MotionCard = motion(Card)
const MotionBox = motion(Box)

export default function Reports() {
    const theme = useTheme()
    const [message, setMessage] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)
    const [chatHistory, setChatHistory] = useState([
        { sender: 'AI', message: 'Welcome to the Financial Reports section. How can I assist you today?' }
    ])

    const handleSendMessage = () => {
        if (message.trim()) {
            setChatHistory([...chatHistory, { sender: 'User', message: message.trim() }])
            setMessage('')
            // Simulate AI response
            setTimeout(() => {
                setChatHistory(prev => [...prev, { sender: 'AI', message: 'I\'m processing your request. Please allow me a moment to generate the appropriate financial report.' }])
            }, 1000)
        }
    }

    const handleAction = (action) =>  {
        console.log(`Generating ${action} report`)
        setChatHistory(prev => [...prev, { sender: 'AI', message: `I'm generating a ${action} report for you. This may take a moment.` }])
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 4 }}>
            <Fade in={showSuccess}>
                <Box sx={{
                    position: 'fixed',
                    top: theme.spacing(2),
                    right: theme.spacing(2),
                    bgcolor: 'success.main',
                    color: 'white',
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: 3,
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 9999,
                }}>
                    <CheckCircleIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">Report generated successfully</Typography>
                    <IconButton size="small" onClick={() => setShowSuccess(false)} sx={{ ml: 2, color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Fade>
            <MotionCard
                sx={{ maxWidth: 'xl', mx: 'auto' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <CardContent>
                    <Typography variant="h4" sx={{ mb: 4 }}>Financial Reports</Typography>

                    {/* Chat History */}
                    <MotionBox
                        sx={{ mb: 4, height: 400, overflowY: 'auto', bgcolor: 'background.paper', p: 3, borderRadius: 2 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <AnimatePresence>
                            {chatHistory.map((chat, index) => (
                                <MotionBox
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    sx={{ mb: 2, textAlign: chat.sender === 'User' ? 'right' : 'left' }}
                                >
                                    <Typography variant="subtitle2" sx={{ color: chat.sender === 'User' ? 'primary.main' : 'secondary.main' }}>
                                        {chat.sender}:
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        display: 'inline-block',
                                        px: 2,
                                        py: 1,
                                        borderRadius: 1,
                                        bgcolor: chat.sender === 'User' ? 'primary.light' : 'secondary.light',
                                        color: chat.sender === 'User' ? 'primary.contrastText' : 'secondary.contrastText'
                                    }}>
                                        {chat.message}
                                    </Typography>
                                </MotionBox>
                            ))}
                        </AnimatePresence>
                    </MotionBox>

                    {/* Message Input */}
                    <Box sx={{ display: 'flex', mb: 3 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Ask about financial reports"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            sx={{ mr: 2 }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSendMessage}
                            startIcon={<SendIcon />}
                        >
                            Send
                        </Button>
                    </Box>

                    {/* Action Buttons */}
                    <Grid container spacing={3}>
                        {[
                            { label: 'Income Statement', icon: BarChartIcon },
                            { label: 'Balance Sheet', icon: PieChartIcon },
                            { label: 'Cash Flow', icon: DownloadIcon },
                        ].map(({ label, icon: Icon }, index) => (
                            <Grid item xs={12} sm={4} key={label}>
                                <MotionBox
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => handleAction(label)}
                                        startIcon={<Icon />}
                                        sx={{
                                            py: 2,
                                            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                                            '&:hover': {
                                                background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                                            }
                                        }}
                                    >
                                        {label}
                                    </Button>
                                </MotionBox>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </MotionCard>
        </Box>
    )
}