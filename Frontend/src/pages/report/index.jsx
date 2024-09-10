import React, { useState } from 'react'
import { BarChart, PieChart, Download, Send, CheckCircle } from 'lucide-react'

export default function Reports() {
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

    const handleAction = (action) => {
        console.log(`Generating ${action} report`)
        setChatHistory(prev => [...prev, { sender: 'AI', message: `I'm generating a ${action} report for you. This may take a moment.` }])
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {showSuccess && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-md flex items-center text-lg z-50">
                    <CheckCircle className="mr-2 h-6 w-6" />
                    Report generated successfully
                </div>
            )}
            <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-md p-8">
                <h2 className="text-4xl font-bold mb-8 text-gray-800">Financial Reports</h2>

                {/* Chat History */}
                <div className="mb-8 h-96 overflow-y-auto bg-gray-50 p-6 rounded-lg shadow-inner">
                    {chatHistory.map((chat, index) => (
                        <div key={index} className={`mb-4 ${chat.sender === 'User' ? 'text-right' : 'text-left'}`}>
                            <p className={`font-bold ${chat.sender === 'User' ? 'text-blue-600' : 'text-green-600'}`}>
                                {chat.sender}:
                            </p>
                            <p className={`inline-block px-4 py-2 rounded-lg shadow ${chat.sender === 'User' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                {chat.message}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="flex items-center mb-6">
                    <input
                        type="text"
                        placeholder="Ask about financial reports"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-grow px-4 py-2 text-lg border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="bg-blue-500 text-white px-6 py-2 rounded-r-md hover:bg-blue-600 transition-colors duration-200 flex items-center"
                    >
                        <Send className="h-6 w-6" />
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { label: 'Income Statement', icon: BarChart },
                        { label: 'Balance Sheet', icon: PieChart },
                        { label: 'Cash Flow', icon: Download },
                    ].map(({ label, icon: Icon }) => (
                        <button
                            key={label}
                            onClick={() => handleAction(label)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors duration-300 flex items-center justify-center text-lg font-semibold shadow-lg transform hover:scale-105"
                        >
                            <Icon className="h-6 w-6 mr-2" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}


