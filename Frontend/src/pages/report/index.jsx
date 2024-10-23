import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO, isValid } from 'date-fns'
import { chatSessions } from '@/hooks/ChatSessions.jsx'
import { fileUpload } from '@/hooks/FileUpload.jsx'
import { FluxMessageWithHistoryAPI, ChatWithFileAPI, ClearFileAPI, ClearFileByFileNameAPI, GenerateReport, UploadFileAPI } from '@/api/ai'
import { formatMessageContent } from '@/utils/messageFormatter'
import MarkdownRenderer from '@/utils/markdown-renderer'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Paperclip, X, Send, Download, Copy, Edit, Trash, ChevronDown, File } from 'lucide-react'
import { GetAllFiles, DownloadFile, DeleteFileByFileName } from "@/api/s3-file"
import { FilePreview } from "@/components/FilePreview"
import { UploadedFiles } from "@/components/UploadedFiles"
import {getFileType} from "@/utils/fileUtils.jsx";

export default function Report() {
  const {
    sessions,
    activeSession,
    setActiveSession,
    addNewSession,
    deleteSession,
    updateSessionName,
    addMessageToActiveSession,
    updateMessageInActiveSession,
  } = chatSessions()
  const { files, uploadFile, clearFiles } = fileUpload()

  const [message, setMessage] = useState('')
  const [isRetrievalMode, setIsRetrievalMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [username, setUsername] = useState(() => localStorage.getItem('username') || 'User')
  const [editSessionId, setEditSessionId] = useState(null)
  const [newSessionName, setNewSessionName] = useState('')
  const fileInputRef = useRef(null)
  const [previewContent, setPreviewContent] = useState(null)
  const [previewFileName, setPreviewFileName] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      const response = await GetAllFiles();
      const files = response?.data || [];
      if (Array.isArray(files)) {
        const validFiles = files
            .filter(file => file != null)
            .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        console.log('Fetched files:', validFiles);
        setUploadedFiles(validFiles);
      } else {
        console.error('Unexpected files format:', files);
        setUploadedFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setUploadedFiles([]);
    }
  };

  const handleDeleteUploadedFile = async (fileName) => {
    if (!fileName) {
      console.error('No fileName provided for deletion');
      return;
    }

    try {
      setIsLoading(true);
      await DeleteFileByFileName(fileName);
      await fetchUploadedFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewFile = async (fileName) => {
    if (!fileName) {
      console.error('No fileName provided for preview');
      return;
    }

    try {
      setIsLoading(true);
      const response = await DownloadFile(fileName);

      if (response.data instanceof Blob) {
        const blob = response.data;
        const fileType = getFileType(fileName);
        if (fileType === 'text' || fileType === 'code') {
          const text = await blob.text();
          setPreviewContent(text);
          setPreviewFileName(fileName);
        } else if (fileType === 'image') {
          const url = URL.createObjectURL(blob);
          setPreviewContent(url);
          setPreviewFileName(fileName);
        } else {
          console.log('File type not supported for preview');
          setPreviewContent(null);
          setPreviewFileName('');
        }
      } else {
        console.error('Unexpected response format:', response);
        setPreviewContent(null);
        setPreviewFileName('');
      }
    } catch (error) {
      console.error('Error previewing file:', error);
      setPreviewContent(null);
      setPreviewFileName('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadUploadedFile = async (fileName) => {
    if (!fileName) {
      console.error('No fileName provided for download');
      return;
    }

    try {
      setIsLoading(true);
      const response = await DownloadFile(fileName);

      if (response.data instanceof Blob) {
        const blob = response.data;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 0);
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (message.trim() || (isRetrievalMode && files.length > 0)) {
      const timestamp = new Date().toISOString();
      addMessageToActiveSession({ sender: username, content: message.trim(), timestamp });

      setMessage('');
      setIsLoading(true);
      setIsTyping(true);

      let messageId;
      try {
        messageId = addMessageToActiveSession({ sender: 'AI', content: '', timestamp: new Date().toISOString() });

        let response;

        if (isRetrievalMode) {
          const formData = new FormData();
          formData.append('prompt', message.trim());
          formData.append('conversationId', activeSession);
          files.forEach((file) => {
            formData.append('files', file);
          });

          response = await ChatWithFileAPI({
            prompt: message.trim(),
            conversationId: activeSession,
            files: formData
          });
        } else {
          response = await FluxMessageWithHistoryAPI({
            prompt: message.trim(),
            sessionId: activeSession,
          });
        }

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
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await UploadFileAPI(formData);
        await uploadFile(selectedFile);
        await fetchUploadedFiles();
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClearFiles = async () => {
    setIsLoading(true)
    try {
      await ClearFileAPI()
      clearFiles()
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchUploadedFiles()
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
      const formattedTime = formatDate(msg.timestamp)
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

  const startEditSession = (id) => {
    setEditSessionId(id)
    setNewSessionName(sessions.find(s => s.id === id)?.name || '')
  }

  const handleEditSessionConfirm = () => {
    if (editSessionId) {
      updateSessionName(editSessionId, newSessionName)
      setEditSessionId(null)
      setNewSessionName('')
    }
  }

  const handleGenerateReport = async () => {
    setIsLoading(true)
    try {
      const response = await GenerateReport()
      const cleanedReport = response.data.replace(/^```[\s\S]*?\n/, '').replace(/\n```$/, '')
      addMessageToActiveSession({
        sender: 'AI',
        content: cleanedReport,
        timestamp: new Date().toISOString(),
        isReport: true
      })
    } catch (error) {
      console.error('Error generating report:', error)
      addMessageToActiveSession({
        sender: 'AI',
        content: 'Sorry, there was an error generating the report.',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFile = async (fileName) => {
    setIsLoading(true)
    try {
      await ClearFileByFileNameAPI(fileName)
      clearFiles()
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchUploadedFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date'
    const date = parseISO(dateString)
    return isValid(date) ? format(date, 'yyyy-MM-dd HH:mm:ss') : 'Invalid Date'
  }

  const canSendMessage = message.trim() || (isRetrievalMode && files.length > 0)
  const currentSession = sessions.find(s => s.id === activeSession)
  const hasMessages = currentSession && currentSession.messages.length > 0

  return (
      <div className="flex flex-col h-screen bg-background">
        <header className="bg-card shadow-sm p-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="ml-12">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="text-lg px-6 py-3">
                    {currentSession?.name || 'Select Session'} <ChevronDown className="ml-2 h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {sessions.map((session) => (
                      <DropdownMenuItem key={session.id} onSelect={() => setActiveSession(session.id)}>
                        <div className="flex items-center justify-between w-full">
                          <span>{session.name}</span>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); startEditSession(session.id); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onSelect={() => addNewSession()}>
                    New Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center space-x-4">
              <UploadedFiles
                  files={uploadedFiles}
                  onPreview={handlePreviewFile}
                  onDownload={handleDownloadUploadedFile}
                  onDelete={handleDeleteUploadedFile}
                  formatDate={formatDate}
              />
              <FilePreview
                  isOpen={!!previewContent}
                  onClose={() => setPreviewContent(null)}
                  content={previewContent}
                  fileName={previewFileName}
                  onDownload={() => handleDownloadUploadedFile(previewFileName)}
              />
              <Button onClick={handleGenerateReport} disabled={isLoading}>

                Generate AI Report
              </Button>
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
          <ScrollArea className="flex-grow">
            <div className="p-4">
              <ChatMessages
                  messages={currentSession?.messages || []}
                  username={username}
                  isTyping={isTyping}
                  handleRetry={handleRetry}
                  handleCopy={handleCopy}
                  handleDownload={handleDownload}
                  formatDate={formatDate}
              />
            </div>
          </ScrollArea>

          {isRetrievalMode && files.length > 0 && (
              <div className="p-4 border-t border-border">
                <h3 className="text-sm font-semibold mb-2">Uploaded Files:</h3>
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                      <div key={index} className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                        <File className="w-4 h-4 mr-2" />
                        {file.name}
                        <button
                            onClick={() => handleDeleteFile(file.name)}
                            className="ml-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                            aria-label={`Delete ${file.name}`}
                        >
                          <X className="w-4 w-4" />
                        </button>
                      </div>
                  ))}
                </div>
              </div>
          )}
          <div className="p-4 border-t border-border flex-shrink-0">
            <div className="flex items-center space-x-2">
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
              <div className="flex space-x-2">
                {isRetrievalMode && (
                    <>
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
                    </>
                )}
                <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !canSendMessage}
                    className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 transform  hover:scale-105 ${
                        canSendMessage
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>

        {editSessionId && (
            <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
              <Card className="w-full max-w-sm">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">Rename Session</h2>
                  <Input
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="Enter new session name"
                      className="mb-4"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditSessionId(null)}>Cancel</Button>
                    <Button onClick={handleEditSessionConfirm}>Save</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
        )}
      </div>
  )
}

function ChatMessages({ messages, username, isTyping, handleRetry, handleCopy, handleDownload, formatDate }) {
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
                    {message.isReport ? (
                        <div className="markdown-content">
                          <MarkdownRenderer content={message.content} />
                        </div>
                    ) : (
                        <p>{message.content}</p>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground flex items-center justify-end space-x-2">
                    <span>{formatDate(message.timestamp)}</span>
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
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
            >
              <div className="bg-secondary rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
  )
}