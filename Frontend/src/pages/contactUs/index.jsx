
import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

const libraries = ["places"]

// Access environment variables using import.meta.env
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Simulated sendEmail function
const sendEmail = async (formData) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (Math.random() > 0.1) {
        return Promise.resolve({ status: 'success' })
    } else {
        return Promise.reject(new Error('Failed to send email'))
    }
}

export default function ContactUs() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const mapContainerStyle = {
        width: '100%',
        height: '450px'
    }

    const center = {
        lat: -33.8882,
        lng: 151.1871
    }

    const mapRef = useRef(null)

    const handleInputChange = (event) => {
        const { name, value } = event.target
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setIsSubmitting(true)
        try {
            await sendEmail(formData)
            toast({
                title: "Message Sent",
                description: "Your message has been sent successfully!",
            })
            setFormData({ name: '', email: '', subject: '', message: '' })
        } catch (error) {
            console.error('Error sending email:', error)
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleMarkerClick = () => {
        console.log('Marker clicked at position:', center)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">Contact Us</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Send us a message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={4}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    <Send className="mr-2 h-4 w-4" />
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center">
                                <Mail className="mr-2 h-5 w-5" />
                                <span>support@example.com</span>
                            </div>
                            <div className="flex items-center">
                                <Phone className="mr-2 h-5 w-5" />
                                <span>+61 2 9351 2222</span>
                            </div>
                            <div className="flex items-center">
                                <MapPin className="mr-2 h-5 w-5" />
                                <span>
                                    The University of Sydney<br />
                                    Camperdown NSW 2006<br />
                                    Australia
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Find Us</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {GOOGLE_MAPS_API_KEY ? (
                            <LoadScript
                                googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                                libraries={libraries}
                            >
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={center}
                                    zoom={15}
                                    onLoad={(map) => mapRef.current = map}
                                >
                                    <Marker
                                        position={center}
                                        onClick={handleMarkerClick}
                                    />
                                </GoogleMap>
                            </LoadScript>
                        ) : (
                            <div className="bg-gray-200 dark:bg-gray-700 h-[450px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                                Google Maps API key is not set
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}