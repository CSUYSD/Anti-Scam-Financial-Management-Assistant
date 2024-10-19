'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayCircle, Globe, Star, ArrowUpRight, Search, Bookmark, BookmarkPlus, Filter, ChevronDown, ChevronUp, BarChart2, Youtube } from 'lucide-react'

export default function EnhancedInvestmentResources() {
    const [activeView, setActiveView] = useState('channels')
    const [openItem, setOpenItem] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [bookmarkedItems, setBookmarkedItems] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [sortBy, setSortBy] = useState('rating')
    const [scrollY, setScrollY] = useState(0)
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const channelsData = [
        {
            id: 1,
            title: "Financial Freedom 101",
            rating: 4.9,
            thumbnail: "https://img.youtube.com/vi/Tb1CLQuJOsE/mqdefault.jpg",
            videoUrl: "https://www.youtube.com/embed/Tb1CLQuJOsE?autoplay=1",
            youtubeUrl: "https://www.youtube.com/watch?v=Tb1CLQuJOsE",
            description: "Learn strategies to achieve financial independence and retire early.",
            category: "Personal Finance",
            views: 1500000,
            likes: 95000,
        },
        {
            id: 2,
            title: "Real Estate Investing Mastery",
            rating: 4.7,
            thumbnail: "https://img.youtube.com/vi/ZykJzwueIzM/mqdefault.jpg",
            videoUrl: "https://www.youtube.com/embed/ZykJzwueIzM?autoplay=1",
            youtubeUrl: "https://www.youtube.com/watch?v=ZykJzwueIzM",
            description: "Discover how to build wealth through strategic real estate investments.",
            category: "Real Estate",
            views: 1200000,
            likes: 88000,
        },
        {
            id: 3,
            title: "Smart Saving Techniques",
            rating: 4.8,
            thumbnail: "https://img.youtube.com/vi/VJXh0Qduup0/mqdefault.jpg",
            videoUrl: "https://www.youtube.com/embed/VJXh0Qduup0?autoplay=1",
            youtubeUrl: "https://www.youtube.com/watch?v=VJXh0Qduup0",
            description: "Master the art of saving money for a secure financial future.",
            category: "Personal Finance",
            views: 980000,
            likes: 76000,
        },
    ]

    const websitesData = [
        {
            id: 1,
            name: "Investopedia",
            url: "https://www.investopedia.com",
            description: "Your source for financial education",
            content: "Comprehensive financial dictionary and investing education.",
            image: "https://www.investopedia.com/thmb/FvDGwJ1kXQNpE2OgMfvyQFka-mQ=/600x320/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/News-Story-Federal-Reserve-Preview-FINAL-2-d4a7d4079433481e8a6611db4f040ca2.png",
            category: "Education",
            monthlyVisits: 28000000,
        },
        {
            id: 2,
            name: "The Motley Fool",
            url: "https://www.fool.com",
            description: "Stock market insights and analysis",
            content: "Expert investment advice, stock research, and market analysis.",
            image: "https://g.foolcdn.com/misc-assets/wf-large-1-oct20.png",
            category: "Stock Analysis",
            monthlyVisits: 15000000,
        },
        {
            id: 3,
            name: "Bloomberg",
            url: "https://www.bloomberg.com",
            description: "Global financial news and data",
            content: "Breaking news, analysis, and market data for informed investing.",
            image: "https://assets.bwbx.io/s3/javelin/public/javelin/images/bloomberg-logo-7146bb67c18ef8e7c83f.png",
            category: "News",
            monthlyVisits: 50000000,
        },
    ]

    const categories = useMemo(() => {
        const allCategories = [...new Set([...channelsData, ...websitesData].map(item => item.category))]
        return ['All', ...allCategories]
    }, [])

    const sortOptions = useMemo(() => {
        if (activeView === 'channels') {
            return [
                { value: 'rating', label: 'Rating' },
                { value: 'views', label: 'Views' },
                { value: 'likes', label: 'Likes' }
            ]
        } else {
            return [{ value: 'monthlyVisits', label: 'Monthly Visits' }]
        }
    }, [activeView])

    const filteredAndSortedItems = useMemo(() => {
        let items = activeView === 'channels' ? channelsData : websitesData

        items = items.filter(item =>
            (item.title || item.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        )

        if (selectedCategory !== 'All') {
            items = items.filter(item => item.category === selectedCategory)
        }

        items.sort((a, b) => {
            if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
            if (sortBy === 'views') return (b.views || 0) - (a.views || 0)
            if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0)
            if (sortBy === 'monthlyVisits') return (b.monthlyVisits || 0) - (a.monthlyVisits || 0)
            return 0
        })

        return items
    }, [activeView, searchTerm, selectedCategory, sortBy])

    const handleViewChange = (view) => {
        setActiveView(view)
        setSelectedCategory('All')
        setSortBy(view === 'channels' ? 'rating' : 'monthlyVisits')
    }

    const handleOpenItem = (item) => {
        setOpenItem(item)
    }

    const handleCloseItem = () => {
        setOpenItem(null)
    }

    const handleBookmark = (item) => {
        setBookmarkedItems(prev =>
            prev.some(bookmarked => bookmarked.id === item.id)
                ? prev.filter(bookmarked => bookmarked.id !== item.id)
                : [...prev, item]
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <motion.div
                    className="flex flex-col items-center mb-8 space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="flex space-x-4 mb-6">
                        <button
                            onClick={() => handleViewChange('channels')}
                            className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                                activeView === 'channels'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <PlayCircle className="inline-block mr-2 h-5 w-5" />
                            Channels
                        </button>
                        <button
                            onClick={() => handleViewChange('websites')}
                            className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                                activeView === 'websites'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <Globe className="inline-block mr-2 h-5 w-5" />
                            Websites
                        </button>
                    </div>

                    <div className="w-full max-w-4xl relative">
                        <div className="flex items-center bg-white rounded-full shadow-md">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="p-3 text-gray-500 hover:text-blue-700 transition-all duration-300"
                            >
                                <Filter className="h-5 w-5" />
                            </button>
                            <input
                                type="text"
                                placeholder="Search resources..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 rounded-full bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
                            />
                            <button
                                className="p-3 text-gray-500 hover:text-blue-700 transition-all duration-300"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
                            onClick={() => setShowFilters(false)}
                        >
                            <motion.div
                                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-2xl font-bold mb-4">Filters and Sorting</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            id="category"
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-3 py-2 rounded-md bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700 transition-all duration-300"
                                        >
                                            {categories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                                        <select
                                            id="sortBy"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-3 py-2 rounded-md bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700 transition-all duration-300"
                                        >
                                            {sortOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-all duration-300"
                                >
                                    Apply Filters
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                    }}
                >
                    {filteredAndSortedItems.map((item) => (
                        <motion.div
                            key={item.id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <img
                                    src={item.thumbnail || item.image}
                                    alt={item.title || item.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">{item.title || item.name}</h3>
                                    <p className="text-gray-600 mb-4">{item.description}</p>
                                    <div className="flex items-center mb-4">
                                        {item.rating && (
                                            <div className="flex items-center mr-4">
                                                <Star className="h-5 w-5 text-yellow-500 mr-1" aria-hidden="true" />
                                                <span>{item.rating}</span>

                                            </div>
                                        )}
                                        {item.monthlyVisits && (
                                            <div className="flex items-center">
                                                <BarChart2 className="h-5 w-5 text-blue-600 mr-1" aria-hidden="true" />
                                                <span>{(item.monthlyVisits / 1000000).toFixed(1)}M visits/month</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        {activeView === 'channels' ? (
                                            <button
                                                onClick={() => handleOpenItem(item)}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-all duration-300"
                                            >
                                                <PlayCircle className="inline-block mr-2 h-5 w-5" aria-hidden="true" />
                                                Watch Now
                                            </button>
                                        ) : (
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-all duration-300"
                                            >
                                                <ArrowUpRight className="inline-block mr-2 h-5 w-5" aria-hidden="true" />
                                                Visit Site
                                            </a>
                                        )}
                                        <button
                                            onClick={() => handleBookmark(item)}
                                            className="p-2 text-gray-500 hover:text-blue-700 transition-all duration-300"
                                            aria-label={bookmarkedItems.some(bookmarked => bookmarked.id === item.id) ? "Remove bookmark" : "Add bookmark"}
                                        >
                                            {bookmarkedItems.some(bookmarked => bookmarked.id === item.id) ?
                                                <Bookmark className="h-6 w-6" aria-hidden="true" /> :
                                                <BookmarkPlus className="h-6 w-6" aria-hidden="true" />
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <AnimatePresence>
                {openItem && activeView === 'channels' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="bg-white rounded-xl overflow-hidden w-full max-w-4xl"
                        >
                            <div className="relative pb-16/9">
                                <iframe
                                    src={openItem.videoUrl}
                                    className="absolute top-0 left-0 w-full h-full"
                                    allowFullScreen
                                    title={openItem.title}
                                />
                            </div>
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-2">{openItem.title}</h2>
                                <p className="text-gray-600 mb-4">{openItem.description}</p>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={handleCloseItem}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full text-sm font-semibold hover:bg-gray-300 transition-all duration-300"
                                    >
                                        Close
                                    </button>
                                    <a
                                        href={openItem.youtubeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-all duration-300 flex items-center"
                                    >
                                        <Youtube className="mr-2 h-5 w-5" aria-hidden="true" />
                                        Watch on YouTube
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                className="fixed bottom-8 right-8 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: scrollY > 100 ? 1 : 0, y: scrollY > 100 ? 0 : 20 }}
                transition={{ duration: 0.3 }}
                aria-label="Scroll to top"
            >
                <ChevronUp className="h-6 w-6" aria-hidden="true" />
            </motion.button>
        </div>
    )
}