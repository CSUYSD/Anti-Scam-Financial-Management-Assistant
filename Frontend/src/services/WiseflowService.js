import PocketBase from 'pocketbase';

/**
 * Static resources for fallback
 */
const staticResources = [
    {
        id: 1,
        title: "Financial Freedom 101",
        thumbnail: "https://img.youtube.com/vi/Tb1CLQuJOsE/mqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/Tb1CLQuJOsE?autoplay=1",
        youtubeUrl: "https://www.youtube.com/watch?v=Tb1CLQuJOsE",
        description: "Learn strategies to achieve financial independence and retire early.",
    },
    {
        id: 2,
        title: "Real Estate Investing Mastery",
        thumbnail: "https://img.youtube.com/vi/ZykJzwueIzM/mqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/ZykJzwueIzM?autoplay=1",
        youtubeUrl: "https://www.youtube.com/watch?v=ZykJzwueIzM",
        description: "Discover how to build wealth through strategic real estate investments.",
    },
    {
        id: 3,
        title: "Smart Saving Techniques",
        thumbnail: "https://img.youtube.com/vi/VJXh0Qduup0/mqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/VJXh0Qduup0?autoplay=1",
        youtubeUrl: "https://www.youtube.com/watch?v=VJXh0Qduup0",
        description: "Master the art of saving money for a secure financial future.",
    },
    {
        id: 4,
        title: "Compound Interest Explained",
        thumbnail: "https://img.youtube.com/vi/59F4DiFquz0/mqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/59F4DiFquz0?autoplay=1",
        youtubeUrl: "https://www.youtube.com/watch?v=59F4DiFquz0",
        description: "Understand the power of compound interest and how it grows your wealth.",
    },
    {
        id: 5,
        title: "Stock Market Fundamentals",
        thumbnail: "https://img.youtube.com/vi/8Ij7A1VCB7I/mqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/8Ij7A1VCB7I?autoplay=1",
        youtubeUrl: "https://www.youtube.com/watch?v=8Ij7A1VCB7I",
        description: "Learn the basics of stock market investing and analysis techniques.",
    },
    {
        id: 6,
        title: "Risk Management in Investing",
        thumbnail: "https://img.youtube.com/vi/lNdOtlpmH5U/mqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/lNdOtlpmH5U?autoplay=1",
        youtubeUrl: "https://www.youtube.com/watch?v=lNdOtlpmH5U",
        description: "Understand and mitigate investment risks for better returns.",
    }
];

/**
 * WiseflowService Class
 * Manages data operations and real-time updates for the investment insights platform
 * Handles both insights and topics with subscription-based updates
 */
class WiseflowService {
    /**
     * Initialize the service with configuration
     * @param {Object} config - Service configuration
     * @param {string} config.baseUrl - PocketBase server URL
     * @param {string} config.adminEmail - Admin email for authentication
     * @param {string} config.adminPassword - Admin password for authentication
     * @param {number} [config.fetchInterval=3600000] - Data fetch interval in milliseconds
     */
    constructor(config) {
        this.config = {
            baseUrl: config.baseUrl,
            adminEmail: config.adminEmail,
            adminPassword: config.adminPassword,
            fetchInterval: config.fetchInterval || 3600000 // Default: 1 hour
        };

        // Initialize PocketBase client
        this.pb = new PocketBase(this.config.baseUrl);

        // Service state
        this.fetchInterval = null;
        this.lastFetchTime = null;
        this.isAuthenticated = false;

        // Subscriber management
        this.insightSubscribers = new Set();
        this.topicSubscribers = new Set();

        // Data state
        this.currentInsights = staticResources;
        this.currentTopics = [];
    }

    /**
     * Authenticate with PocketBase server
     * @private
     * @throws {Error} If authentication fails
     */
    async authenticate() {
        if (this.isAuthenticated) return;

        try {
            await this.pb.admins.authWithPassword(
                this.config.adminEmail,
                this.config.adminPassword
            );
            this.isAuthenticated = true;
        } catch (error) {
            console.error('Authentication failed:', error);
            this.isAuthenticated = false;
            throw error;
        }
    }

    /**
     * Fetch insights from the server
     * @returns {Promise<Array>} Array of insights
     */
    async fetchInsights() {
        try {
            await this.authenticate();

            const records = await this.pb.collection('insights').getList(1, 50, {
                sort: '-created',
            });

            // Format insights to match expected structure
            const formattedInsights = records.items.map(item => ({
                id: item.id,
                title: item.title || 'Untitled',
                thumbnail: item.thumbnail,
                videoUrl: item.videoUrl,
                youtubeUrl: item.youtubeUrl,
                description: item.description || '',
            }));

            // Use static resources if no data is returned
            this.currentInsights = formattedInsights.length > 0 ? formattedInsights : staticResources;
            this.notifyInsightSubscribers();
            return this.currentInsights;
        } catch (error) {
            console.error('Failed to fetch insights:', error);
            this.currentInsights = staticResources;
            this.notifyInsightSubscribers();
            return staticResources;
        }
    }

    /**
     * Fetch all active topics
     * @returns {Promise<Array>} Array of topics
     */
    async fetchTopics() {
        try {
            await this.authenticate();

            const records = await this.pb.collection('tags').getList(1, 50, {
                sort: 'created',
                filter: 'activated = true'
            });

            this.currentTopics = records.items;
            this.notifyTopicSubscribers();
            return this.currentTopics;
        } catch (error) {
            console.error('Failed to fetch topics:', error);
            throw error;
        }
    }

    /**
     * Save new topics
     * @param {Array<Object>} topics - Array of topic objects with name and explaination
     * @returns {Promise<Object>} Result object
     */
    async saveTopics(topics) {
        try {
            await this.authenticate();

            const results = await Promise.all(
                topics.map(topic =>
                    this.pb.collection('tags').create({
                        name: topic.name,
                        explaination: topic.explaination || '',
                        activated: true,
                        created: new Date().toISOString(),
                    })
                )
            );

            await this.fetchTopics();
            return {
                success: true,
                data: results,
                message: 'Topics saved successfully'
            };
        } catch (error) {
            console.error('Failed to save topics:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to save topics'
            };
        }
    }

    /**
     * Update an existing topic
     * @param {string} id - Topic ID
     * @param {Object} updates - Topic updates including name and explaination
     * @returns {Promise<Object>} Result object
     */
    async updateTopic(id, updates) {
        try {
            await this.authenticate();

            const result = await this.pb.collection('tags').update(id, {
                ...updates,
                updated: new Date().toISOString()
            });

            await this.fetchTopics();
            return {
                success: true,
                data: result,
                message: 'Topic updated successfully'
            };
        } catch (error) {
            console.error('Failed to update topic:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update topic'
            };
        }
    }

    /**
     * Soft delete a topic by marking it as inactive
     * @param {string} id - Topic ID to delete
     * @returns {Promise<Object>} Result object
     */
    async softDeleteTopic(id) {
        try {
            await this.authenticate();

            await this.pb.collection('tags').update(id, {
                activated: false,
                updated: new Date().toISOString()
            });

            await this.fetchTopics();
            return {
                success: true,
                message: 'Topic deleted successfully'
            };
        } catch (error) {
            console.error('Failed to delete topic:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete topic'
            };
        }
    }

    /**
     * Subscribe to insights updates
     * @param {Function} callback - Callback function to receive updates
     */
    subscribe(callback) {
        this.insightSubscribers.add(callback);
        callback(this.currentInsights);
        this.startPeriodicFetch();
    }

    /**
     * Unsubscribe from insights updates
     * @param {Function} callback - Callback function to remove
     */
    unsubscribe(callback) {
        this.insightSubscribers.delete(callback);
        if (this.insightSubscribers.size === 0) {
            this.stopPeriodicFetch();
        }
    }

    /**
     * Subscribe to topics updates
     * @param {Function} callback - Callback function to receive updates
     */
    subscribeToTopics(callback) {
        this.topicSubscribers.add(callback);
        callback(this.currentTopics);
        this.fetchTopics().catch(console.error);
    }

    /**
     * Unsubscribe from topics updates
     * @param {Function} callback - Callback function to remove
     */
    unsubscribeFromTopics(callback) {
        this.topicSubscribers.delete(callback);
    }

    /**
     * Notify all insight subscribers of updates
     * @private
     */
    notifyInsightSubscribers() {
        this.insightSubscribers.forEach(callback => {
            try {
                callback(this.currentInsights);
            } catch (error) {
                console.error('Insight subscriber callback error:', error);
            }
        });
    }

    /**
     * Notify all topic subscribers of updates
     * @private
     */
    notifyTopicSubscribers() {
        this.topicSubscribers.forEach(callback => {
            try {
                callback(this.currentTopics);
            } catch (error) {
                console.error('Topic subscriber callback error:', error);
            }
        });
    }

    /**
     * Start periodic data fetching
     * @private
     */
    startPeriodicFetch() {
        if (this.fetchInterval) return;

        this.fetchInsights().catch(console.error);
        this.fetchInterval = setInterval(() => {
            this.fetchInsights().catch(console.error);
        }, this.config.fetchInterval);
    }

    /**
     * Stop periodic data fetching
     * @private
     */
    stopPeriodicFetch() {
        if (this.fetchInterval) {
            clearInterval(this.fetchInterval);
            this.fetchInterval = null;
        }
    }

    /**
     * Clean up service resources
     * Call this when the service is no longer needed
     */
    destroy() {
        this.stopPeriodicFetch();
        this.insightSubscribers.clear();
        this.topicSubscribers.clear();
        this.currentInsights = staticResources;
        this.currentTopics = [];
    }
}

// Create and export singleton instance
const wiseflowService = new WiseflowService({
    baseUrl: 'http://127.0.0.1:8090',
    adminEmail: 'songguocheng348@gmail.com',
    adminPassword: 'Ericsgc@119742',
    fetchInterval: 3600000 // 1 hour
});

export default wiseflowService;