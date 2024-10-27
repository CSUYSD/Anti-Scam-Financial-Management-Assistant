import React, { useState, useCallback, useEffect } from 'react'
import { NavLink, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
    LayoutDashboard,
    DollarSign,
    BarChart,
    Briefcase,
    TrendingUp,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    Settings,
    LogOut,
    MessageCircle,
    Send,
    X,
} from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"

import { logoutAPI } from '@/api/user'
import { removeToken } from "@/utils/index"
import { chatSessions } from '@/hooks/ChatSessions.jsx'
import { ChatWithFileAPI } from '@/api/ai'
import WebSocketService from "@/services/WebSocketService.js"

const NavItem = React.forwardRef(({ icon: Icon, children, to, onClick, collapsed, ...props }, ref) => {
    const location = useLocation()
    const isActive = location.pathname === to

    return (
        <NavLink
            ref={ref}
            to={to}
            onClick={onClick}
            {...props}
            className={cn(
                "flex items-center py-2 px-4 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 ease-in-out",
                isActive ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-gray-100",
                collapsed ? "justify-center" : "justify-start"
            )}
        >
            <Icon className={cn("w-5 h-5", collapsed ? "" : "mr-3")} />
            {!collapsed && <span>{children}</span>}
        </NavLink>
    )
})

const MainListItems = ({ collapsed }) => (
    <>
        <NavItem icon={LayoutDashboard} to="/" collapsed={collapsed}>
            Dashboard
        </NavItem>
        <NavItem icon={DollarSign} to="/transaction" collapsed={collapsed}>
            Transaction
        </NavItem>
        <NavItem icon={BarChart} to="/report" collapsed={collapsed}>
            Reports
        </NavItem>
        <NavItem icon={Briefcase} to="/investment" collapsed={collapsed}>
            Investment
        </NavItem>
        <NavItem icon={TrendingUp} to="/stock-market" collapsed={collapsed}>
            Stock Market
        </NavItem>
        <NavItem icon={HelpCircle} to="/contact-us" collapsed={collapsed}>
            Contact Us
        </NavItem>
    </>
)

const SecondaryListItems = ({ collapsed, onLogout }) => (
    <>
        <NavItem icon={Settings} to="/account" collapsed={collapsed}>
            Account Settings
        </NavItem>
        <NavItem icon={LogOut} to="#" onClick={onLogout} collapsed={collapsed}>
            Logout
        </NavItem>
    </>
)

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false)
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
    } = chatSessions()
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [username, setUsername] = useState(() => localStorage.getItem('username') || 'User')

    const toggleSidebar = () => {
        setCollapsed(!collapsed)
    }

    const handleLogout = async () => {
        try {
            await logoutAPI()
            removeToken()
            localStorage.removeItem('username')
            localStorage.removeItem('chatSessions')
            localStorage.removeItem('uploadedFiles')
            WebSocketService.handleLogout()
            navigate('/login')
            toast({
                title: "Logged out successfully",
                description: "You have been logged out of your account.",
            })
        } catch (error) {
            console.error('Logout failed:', error)
            toast({
                title: "Logout Failed",
                description: "An error occurred during logout. Please try again.",
                variant: "destructive",
            })
        }
    }

    const toggleChat = useCallback(() => {
        setChatOpen(!chatOpen)
        if (!chatOpen && sessions.length === 0) {
            addNewSession()
        }
    }, [chatOpen, sessions, addNewSession])

    const handleSendMessage = useCallback(async () => {
        if (message.trim()) {
            const timestamp = new Date().toISOString()
            const userMessage = { sender: username, content: message.trim(), timestamp }
            addMessageToActiveSession(userMessage)

            setMessage('')
            setIsLoading(true)
            setIsTyping(true)

            try {
                const messageId = addMessageToActiveSession({ sender: 'AI', content: '', timestamp: new Date().toISOString() })

                const response = await ChatWithFileAPI({
                    inputMessage: {
                        conversationId: activeSession,
                        message: message.trim(),
                    },
                    params: {
                        enableAgent: false,
                        enableVectorStore: false,
                    },
                })

                if (response.data) {
                    updateMessageInActiveSession(messageId, {
                        content: response.data,
                        timestamp: new Date().toISOString()
                    })
                } else {
                    updateMessageInActiveSession(messageId, { content: 'Sorry, no response received from the AI.' })
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
    }, [message, username, activeSession, addMessageToActiveSession, updateMessageInActiveSession])

    useEffect(() => {
        if (location.pathname === '/report') {
            setChatOpen(false)
        }
    }, [location.pathname])

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <aside className={cn(
                "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out",
                collapsed ? "w-20" : "w-64"
            )}>
                <div className="flex items-center justify-between p-4">
                    {!collapsed && <img src="/logo.png" alt="Logo" className="h-8" />}
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                </div>
                <Separator />
                <div className={cn("p-4", collapsed ? "flex justify-center" : "")}>
                    <Button
                        variant="ghost"
                        className={cn("w-full", collapsed ? "p-0" : "justify-start")}
                        onClick={() => navigate('/userprofile')}
                    >
                        <Avatar className={cn("w-8 h-8", collapsed ? "" : "mr-2")}>
                            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${username}`} alt={username} />
                            <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {!collapsed && (
                            <span className="truncate">{username}</span>
                        )}
                    </Button>
                </div>
                <Separator />
                <ScrollArea className="flex-1 h-[calc(100vh-16rem)]">
                    <nav className="space-y-1 px-2 py-4">
                        <MainListItems collapsed={collapsed} />
                    </nav>
                    <Separator className="my-4" />
                    <nav className="space-y-1 px-2 py-4">
                        <SecondaryListItems collapsed={collapsed} onLogout={handleLogout} />
                    </nav>
                </ScrollArea>
            </aside>

            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                <Outlet />
            </main>

            {location.pathname !== '/report' && (
                <motion.div
                    className="fixed bottom-4 right-4"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <Button onClick={toggleChat} size="icon" className="rounded-full h-12 w-12">
                        <MessageCircle className="h-6 w-6" />
                    </Button>
                </motion.div>
            )}

            <AnimatePresence>
                {chatOpen && location.pathname !== '/report' && (
                    <motion.div
                        className="fixed bottom-20 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.3 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <Card>
                            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                                <h3 className="font-semibold text-lg">AI Assistant</h3>
                                <Button variant="ghost" size="icon" onClick={toggleChat}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardContent>
                                <ScrollArea className="h-96 pr-4">
                                    {sessions.find(s => s.id === activeSession)?.messages.map((message, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`mb-4 ${message.sender === username ? 'text-right' : 'text-left'}`}
                                        >
                                            <div className={`inline-block p-2 rounded-lg ${message.sender === username ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}>
                                                <p className="text-sm">{message.content}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {format(new Date(message.timestamp), 'HH:mm')}
                                            </p>
                                        </motion.div>
                                    ))}
                                    {isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="text-left mb-4"
                                        >
                                            <div className="inline-block p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                                                <p className="text-sm">AI is typing...</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </ScrollArea>
                                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="mt-4">
                                    <div className="flex space-x-2">
                                        <Input
                                            type="text"
                                            placeholder="Type your message..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <Button type="submit" disabled={isLoading || !message.trim()} size="icon">
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}