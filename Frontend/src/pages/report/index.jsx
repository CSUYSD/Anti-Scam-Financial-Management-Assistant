'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatSessions } from '@/hooks/useChatSessions'
import { useFileUpload } from '@/hooks/useFileUpload'
import { FluxMessageWithHistoryAPI, ChatWithFileAPI, ClearFileAPI } from '@/api/ai'
import { formatMessageContent } from '@/utils/messageFormatter'
import { format, parseISO } from 'date-fns'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Paperclip, X, Send, Download, Copy } from 'lucide-react'

export default function Web3Chat() {
  const {
    sessions,
    activeSession,
    setActiveSession,
    addNewSession,
    deleteSession,
    updateSessionName,
    addMessageToActiveSession,
    updateMessageInActiveSession,
  } = useChatSessions()
  const { files, uploadFile, clearFiles } = useFileUpload()

  const [message, setMessage] = useState('')
  const [isRetrievalMode, setIsRetrievalMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [username, setUsername] = useState(() => localStorage.getItem('username') || 'User')
  const fileInputRef = useRef(null)

  const handleSendMessage = useCallback(async () => {
    if (message.trim() || (isRetrievalMode && files.length > 0)) {
      const decodedMessage = decodeURIComponent(message.trim());
      console.log("User input:", decodedMessage);

      const timestamp = new Date().toISOString();
      addMessageToActiveSession({ sender: username, content: decodedMessage, timestamp });

      setMessage('');
      setIsLoading(true);
      setIsTyping(true);

      let messageId;
      try {
        messageId = addMessageToActiveSession({ sender: 'AI', content: '', timestamp: new Date().toISOString() });

        const params = {
          prompt: decodedMessage,
          sessionId: activeSession,
        };

        if (isRetrievalMode) {
          params.files = files.map(f => f.name).join(',');
        }

        const response = await (isRetrievalMode ? ChatWithFileAPI(params) : FluxMessageWithHistoryAPI(params));

        let aiResponse = '';
        const processChunk = (chunk) => {
          const lines = chunk.split('\n');
          lines.forEach(line => {
            if (line.startsWith('data:')) {
              const messagePart = line.replace('data:', '').trim();
              if (messagePart) {
                aiResponse = formatMessageContent(aiResponse, messagePart);
                updateMessageInActiveSession(messageId, { content: aiResponse });
              }
            }
          });
        };

        if (response.data) {
          processChunk(response.data);
        }

      } catch (error) {
        console.error('Error sending message:', error);
        if (messageId) {
          updateMessageInActiveSession(messageId, { content: 'Sorry, there was an error processing your request.' });
        }
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    }
  }, [message, activeSession, isRetrievalMode, files, username, addMessageToActiveSession, updateMessageInActiveSession]);

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setIsLoading(true)
      try {
        await uploadFile(selectedFile)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleClearFiles = async () => {
    setIsLoading(true)
    try {
      await ClearFileAPI()
      clearFiles()
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      console.error('Error clearing files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = async () => {
    const currentSession = sessions.find(s => s.id === activeSession)
    if (!currentSession) return

    const lastUserMessage = [...currentSession.messages].reverse().find(m => m.sender === username)
    if (!lastUserMessage) return

    const updatedMessages = currentSession.messages.slice(0, -1)
    updateSessionName(activeSession, currentSession.name)

    setMessage(lastUserMessage.content)
    await handleSendMessage()
  }

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      console.log('Content copied to clipboard')
    }, (err) => {
      console.error('Could not copy text: ', err)
    })
  }

  const handleDownload = (content) => {
    const element = document.createElement("a")
    const file = new Blob([content], {type: 'text/markdown'})
    element.href = URL.createObjectURL(file)
    element.download = "ai_response.md"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleExportConversation = () => {
    const currentSession = sessions.find(s => s.id === activeSession)
    if (!currentSession) return

    let exportContent = `Conversation Export - ${currentSession.name}\n\n`
    currentSession.messages.forEach((msg) => {
      const formattedTime = format(parseISO(msg.timestamp), 'yyyy-MM-dd HH:mm:ss')
      exportContent += `[${formattedTime}] ${msg.sender}:\n${msg.content}\n\n`
    })

    const element = document.createElement("a")
    const file = new Blob([exportContent], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = `conversation_export_${currentSession.name}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const canSendMessage = message.trim() || (isRetrievalMode && files.length > 0)
  const currentSession = sessions.find(s => s.id === activeSession)
  const hasMessages = currentSession && currentSession.messages.length > 0

  return (
      <div className="flex flex-col h-full bg-background">
        <header className="bg-card shadow-sm p-4">
          <div className="flex justify-between items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {currentSession?.name || 'Select Session'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sessions.map((session) => (
                    <DropdownMenuItem key={session.id} onSelect={() => setActiveSession(session.id)}>
                      {session.name}
                    </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                    id="retrieval-mode"
                    checked={isRetrievalMode}
                    onCheckedChange={setIsRetrievalMode}
                />
                <Label htmlFor="retrieval-mode">Retrieval Mode</Label>
              </div>
              <button
                  onClick={handleExportConversation}
                  disabled={!hasMessages}
                  className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors duration-200"
                  aria-label="Export conversation"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow overflow-hidden flex flex-col">
          <ScrollArea className="flex-grow p-4">
            <ChatMessages
                messages={currentSession?.messages || []}
                username={username}
                isTyping={isTyping}
                handleRetry={handleRetry}
                handleCopy={handleCopy}
                handleDownload={handleDownload}
            />
          </ScrollArea>
          <div className="p-4 border-t border-border">
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
              <textarea
                  className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition-shadow duration-200"
                  rows={1}
                  placeholder="Type your message here"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={isLoading}
              />
              </div>
              {isRetrievalMode && (
                  <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        aria-label="Upload file"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleClearFiles}
                        disabled={isLoading || files.length === 0}
                        aria-label="Clear files"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
              )}
              <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !canSendMessage}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105 ${
                      canSendMessage
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
  )
}

function ChatMessages({ messages, username, isTyping, handleRetry, handleCopy, handleDownload }) {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
      <div className="space-y-4">
        {messages.map((message, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === username ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-4 max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${message.sender === username ? 'flex-row-reverse' : ''}`}>
                <img
                    src={message.sender === username ? 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' : 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'}
                    alt={`${message.sender} avatar`}
                    className="w-10 h-10 rounded-full"
                />
                <div className={`${message.sender === username ? 'text-right' : 'text-left'}`}>
                  <div className={`rounded-lg p-3 ${message.sender === username ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({node, inline, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                                <SyntaxHighlighter
                                    style={tomorrow}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                            )
                          }
                        }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground flex items-center justify-end space-x-2">
                    <span>{message.timestamp ? format(parseISO(message.timestamp), 'HH:mm:ss') : 'No timestamp'}</span>
                    {message.sender !== username && (
                        <>
                          <button onClick={() => handleCopy(message.content)} className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-200" aria-label="Copy message">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDownload(message.content)} className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-200" aria-label="Download message">
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
        ))}
        {isTyping && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1,

                  y: 0 }}
                className="flex justify-start"
            >
              <div className="bg-secondary rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
  )
}