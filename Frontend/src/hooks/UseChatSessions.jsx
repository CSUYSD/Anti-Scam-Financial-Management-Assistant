import { useState, useEffect,useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useChatSessions() {
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

    useEffect(() => {
        try {
            localStorage.setItem('chatSessions', JSON.stringify(sessions));
        } catch (error) {
            console.error('Error saving sessions to localStorage:', error);
        }
    }, [sessions]);

    const addNewSession = (name) => {
        const newSession = { id: uuidv4(), name: name || `New Chat ${sessions.length + 1}`, messages: [] };
        setSessions(prev => [...prev, newSession]);
        setActiveSession(newSession.id);
    };

    const deleteSession = (id) => {
        if (sessions.length > 1) {
            setSessions(prev => prev.filter(s => s.id !== id));
            if (activeSession === id) {
                setActiveSession(sessions.find(s => s.id !== id)?.id || '');
            }
        }
    };

    const updateSessionName = (id, newName) => {
        setSessions(prev => prev.map(s =>
            s.id === id ? { ...s, name: newName } : s
        ));
    };

    const addMessageToActiveSession = (message) => {
        const messageId = uuidv4();
        setSessions(prev => prev.map(s =>
            s.id === activeSession ? { ...s, messages: [...s.messages, { id: messageId, ...message }] } : s
        ));
        return messageId; // 返回消息的唯一ID，用于后续更新
    };


    const updateMessageInActiveSession = useCallback((messageId, updatedMessage) => {
        setSessions(prev => prev.map(s =>
            s.id === activeSession
                ? { ...s, messages: s.messages.map(m => m.id === messageId ? { ...m, ...updatedMessage } : m) }
                : s
        ));
    }, [activeSession, setSessions]);

    return {
        sessions,
        activeSession,
        setActiveSession,
        addNewSession,
        deleteSession,
        updateSessionName,
        addMessageToActiveSession,
        updateMessageInActiveSession,
    };
}