import React from 'react';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    TextField,
    Paper,
    Divider,
} from '@mui/material';
import {
    Chat as ChatIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    InsertDriveFile as FileIcon,
    Upload as UploadIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = ({
                            sessions,
                            activeSession,
                            setActiveSession,
                            addNewSession,
                            deleteSession,
                            startEditSession,
                            editSessionId,
                            newSessionName,
                            setNewSessionName,
                            handleEditSessionConfirm,
                            isRetrievalMode,
                            files,
                            handleFileUpload,
                            fileInputRef,
                            isLoading,
                        }) => {
    return (
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
                                        bgcolor: 'primary.light',
                                        '&:hover': {
                                            bgcolor: 'primary.light',
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
    );
};