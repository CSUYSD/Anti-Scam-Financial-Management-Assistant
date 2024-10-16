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
import { Transition } from '@headlessui/react'

export default function EnhancedChatInterface() {
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
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
  const [editSessionId, setEditSessionId] = useState(null)
  const fileInputRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [username, setUsername] = useState(() => localStorage.getItem('username') || 'User')

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


  const handleNewSessionConfirm = () => {
    addNewSession(newSessionName)
    setNewSessionDialogOpen(false)
    setNewSessionName('')
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


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
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
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <AnimatePresence>
          {sidebarOpen && (
              <motion.div
                  initial={{ x: -240 }}
                  animate={{ x: 0 }}
                  exit={{ x: -240 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="w-60 flex-shrink-0 overflow-hidden bg-white shadow-lg"
              >
                <Sidebar
                    sessions={sessions}
                    activeSession={activeSession}
                    setActiveSession={setActiveSession}
                    addNewSession={() => setNewSessionDialogOpen(true)}
                    deleteSession={deleteSession}
                    startEditSession={startEditSession}
                    editSessionId={editSessionId}
                    newSessionName={newSessionName}
                    setNewSessionName={setNewSessionName}
                    handleEditSessionConfirm={handleEditSessionConfirm}
                    isRetrievalMode={isRetrievalMode}
                    files={files}
                    handleFileUpload={handleFileUpload}
                    fileInputRef={fileInputRef}
                    isLoading={isLoading}
                    handleClearFiles={handleClearFiles}
                />
              </motion.div>
          )}
        </AnimatePresence>


        <div className="flex-grow flex flex-col h-full overflow-hidden bg-white">
          <header className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex items-center">
              <button onClick={toggleSidebar} className="mr-4 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {currentSession?.name || 'New Chat'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="flex items-center cursor-pointer">
                  <span className="mr-2 text-sm text-gray-700">Retrieval Mode</span>
                  <div className="relative">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={isRetrievalMode}
                        onChange={(e) => {
                          setIsRetrievalMode(e.target.checked)
                          if (!e.target.checked) {
                            handleClearFiles()
                          }
                        }}
                    />
                    <div className="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
                    <div className={`absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition-transform duration-200 ease-in-out ${isRetrievalMode ? 'transform translate-x-full bg-blue-600' : ''}`}></div>
                  </div>
                </label>
                {isRetrievalMode && (
                    <button
                        onClick={handleClearFiles}
                        disabled={isLoading || files.length === 0}
                        className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                )}
              </div>
              <button
                  onClick={handleExportConversation}
                  disabled={!hasMessages}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>
          </header>


          <main className="flex-grow overflow-hidden flex flex-col">
            <div className="flex-grow overflow-y-auto p-4">
              <ChatMessages
                  messages={currentSession?.messages || []}
                  username={username}
                  isTyping={isTyping}
                  handleRetry={handleRetry}
                  handleCopy={handleCopy}
                  handleDownload={handleDownload}
              />
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end space-x-2">
                <div className="flex-grow">
               <textarea
                   className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow duration-200"
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
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        disabled={isLoading}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}   d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                )}
                <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !canSendMessage}
                    className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105 ${
                        canSendMessage
                            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  Send
                </button>
              </div>
            </div>
          </main>
        </div>


        <AnimatePresence>
          {newSessionDialogOpen && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
              >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-lg p-6 w-96 shadow-xl"
                >
                  <h2 className="text-xl font-bold mb-4">Create New Chat Session</h2>
                  <input
                      type="text"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="Session Name"
                      className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => setNewSessionDialogOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                        onClick={handleNewSessionConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Create
                    </button>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  )
}


function Sidebar({ sessions, activeSession, setActiveSession, addNewSession, deleteSession, startEditSession, editSessionId, newSessionName, setNewSessionName, handleEditSessionConfirm, isRetrievalMode, files, handleFileUpload, fileInputRef, isLoading, handleClearFiles }) {
  return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
              onClick={addNewSession}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105"
          >
            New Chat
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {sessions.map((session) => (
              <Transition
                  key={session.id}
                  show={true}
                  enter="transition-opacity duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition-opacity duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
              >
                <div
                    className={`p-4 cursor-pointer hover:bg-gray-100 ${activeSession === session.id ? 'bg-gray-200' : ''} transition-colors duration-200`}
                    onClick={() => setActiveSession(session.id)}
                >
                  {editSessionId === session.id ? (
                      <input
                          type="text"
                          value={newSessionName}
                          onChange={(e) => setNewSessionName(e.target.value)}
                          onBlur={handleEditSessionConfirm}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleEditSessionConfirm()
                            }
                          }}
                          className="w-full p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200"
                          autoFocus
                      />
                  ) : (
                      <div className="flex justify-between items-center">
                        <span className="truncate">{session.name}</span>
                        <div className="flex space-x-2">
                          <button onClick={() => startEditSession(session.id)} className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => deleteSession(session.id)} className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                  )}
                </div>
              </Transition>
          ))}
        </div>
        {isRetrievalMode && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="font-semibold mb-2">Uploaded Files</h3>
              <ul className="space-y-2 mb-4">
                {files.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {file.name}
                    </li>
                ))}
              </ul>
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
              />
              <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
              >
                Upload File
              </button>
            </div>
        )}
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
                  <div className={`rounded-lg p-3 ${message.sender === username ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
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
                  <div className="mt-1 text-xs text-gray-500 flex items-center justify-end space-x-2">
                    <span>{message.timestamp ? format(parseISO(message.timestamp), 'HH:mm:ss') : 'No timestamp'}</span>
                    {message.sender !== username && (
                        <>
                          <button onClick={() => handleCopy(message.content)} className="p-1 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDownload(message.content)} className="p-1 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
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
              <div className="bg-gray-200 rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
  )
}

