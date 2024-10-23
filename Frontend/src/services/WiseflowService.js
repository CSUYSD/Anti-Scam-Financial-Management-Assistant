import PocketBase from 'pocketbase';

// 静态数据保持不变
const staticArticles = [
    {
        id: 1,
        title: "Understanding Market Trends",
        url: "https://example.com/market-trends",
        abstract: "A comprehensive analysis of current market trends and their implications for investors.",
        content: "Market trends are essential indicators that help investors make informed decisions...",
        publish_time: "2024-02-20T10:00:00Z"
    },
    {
        id: 2,
        title: "Investment Strategies 2024",
        url: "https://example.com/investment-2024",
        abstract: "Key investment strategies to consider in the current economic climate.",
        content: "As we navigate through 2024, several investment strategies have emerged as particularly effective...",
        publish_time: "2024-02-19T15:30:00Z"
    }
];

const staticTopics = [
    {
        id: 1,
        name: "Market Analysis",
        explanation: "Analysis of market trends and patterns",
        activated: true
    },
    {
        id: 2,
        name: "Investment Strategy",
        explanation: "Different approaches to investment",
        activated: true
    }
];

class WiseflowService {
    constructor(config) {
        this.config = {
            baseUrl: config.baseUrl,
            adminEmail: config.adminEmail,
            adminPassword: config.adminPassword,
            fetchInterval: config.fetchInterval || 3600000
        };

        this.pb = new PocketBase(this.config.baseUrl);
        this.fetchInterval = null;
        this.lastFetchTime = null;

        this.articleSubscribers = new Set();
        this.topicSubscribers = new Set();

        this.currentArticles = staticArticles;
        this.currentTopics = staticTopics;
    }

    /**
     * 异步认证方法
     */
    async authenticate() {
        try {
            // 检查当前认证状态
            if (this.pb.authStore.isValid) {
                console.log('Using existing authentication');
                return true;
            }

            const authData = await this.pb.admins.authWithPassword(
                this.config.adminEmail,
                this.config.adminPassword
            );

            const isValid = this.pb.authStore.isValid;
            console.log('Authentication successful:', {
                isValid,
                model: this.pb.authStore.model?.email
            });

            return isValid;
        } catch (error) {
            console.error('Authentication error:', error);
            this.pb.authStore.clear();
            return false;
        }
    }

    /**
     * 异步获取文章列表
     */
    async fetchArticles() {
        try {
            const isAuthenticated = await this.authenticate();
            if (!isAuthenticated) {
                console.log('Using static articles due to authentication failure');
                this.currentArticles = staticArticles;
                this.notifyArticleSubscribers();
                return staticArticles;
            }

            const records = await this.pb.collection('articles').getList(1, 50, {
                sort: '-publish_time'
            });

            const formattedArticles = records.items.map(item => ({
                id: item.id,
                title: item.title || 'Untitled',
                url: item.url || '',
                abstract: item.abstract || '',
                content: item.content || '',
                publish_time: item.publish_time || new Date().toISOString()
            }));

            this.currentArticles = formattedArticles.length > 0 ? formattedArticles : staticArticles;
            this.notifyArticleSubscribers();
            return this.currentArticles;
        } catch (error) {
            console.error('Failed to fetch articles:', error);
            this.currentArticles = staticArticles;
            this.notifyArticleSubscribers();
            return staticArticles;
        }
    }

    /**
     * 异步获取主题列表
     */
    async fetchTopics() {
        try {
            const isAuthenticated = await this.authenticate();
            if (!isAuthenticated) {
                console.log('Using static topics due to authentication failure');
                this.currentTopics = staticTopics;
                this.notifyTopicSubscribers();
                return staticTopics;
            }

            const records = await this.pb.collection('tags').getList(1, 50, {
                sort: 'created',
                filter: 'activated = true'
            });

            const formattedTopics = records.items.map(item => ({
                id: item.id,
                name: item.name,
                explanation: item.explanation || '',
                activated: item.activated !== false
            }));

            this.currentTopics = formattedTopics.length > 0 ? formattedTopics : staticTopics;
            this.notifyTopicSubscribers();
            return this.currentTopics;
        } catch (error) {
            console.error('Failed to fetch topics:', error);
            this.currentTopics = staticTopics;
            this.notifyTopicSubscribers();
            return staticTopics;
        }
    }

    /**
     * 创建新文章
     */
    async createArticle(article) {
        try {
            const isAuthenticated = await this.authenticate();
            if (!isAuthenticated) {
                throw new Error('Authentication required');
            }

            const result = await this.pb.collection('articles').create({
                title: article.title,
                url: article.url,
                abstract: article.abstract,
                content: article.content,
                publish_time: new Date().toISOString()
            });

            await this.fetchArticles();
            return {
                success: true,
                data: result,
                message: 'Article created successfully'
            };
        } catch (error) {
            console.error('Failed to create article:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to create article'
            };
        }
    }

    /**
     * 创建新主题
     */
    async createTopic(topic) {
        try {
            const isAuthenticated = await this.authenticate();
            if (!isAuthenticated) {
                throw new Error('Authentication required');
            }

            const result = await this.pb.collection('tags').create({
                name: topic.name,
                explanation: topic.explanation || '',
                activated: true,
                created: new Date().toISOString()
            });

            await this.fetchTopics();
            return {
                success: true,
                data: result,
                message: 'Topic created successfully'
            };
        } catch (error) {
            console.error('Failed to create topic:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to create topic'
            };
        }
    }

    /**
     * 更新文章
     */
    async updateArticle(id, updates) {
        try {
            const isAuthenticated = await this.authenticate();
            if (!isAuthenticated) {
                throw new Error('Authentication required');
            }

            const result = await this.pb.collection('articles').update(id, {
                ...updates,
                updated: new Date().toISOString()
            });

            await this.fetchArticles();
            return {
                success: true,
                data: result,
                message: 'Article updated successfully'
            };
        } catch (error) {
            console.error('Failed to update article:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update article'
            };
        }
    }

    /**
     * 更新主题
     */
    async updateTopic(id, updates) {
        try {
            const isAuthenticated = await this.authenticate();
            if (!isAuthenticated) {
                throw new Error('Authentication required');
            }

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
     * 删除文章
     */
    async deleteArticle(id) {
        try {
            const isAuthenticated = await this.authenticate();
            if (!isAuthenticated) {
                throw new Error('Authentication required');
            }

            await this.pb.collection('articles').delete(id);
            await this.fetchArticles();
            return {
                success: true,
                message: 'Article deleted successfully'
            };
        } catch (error) {
            console.error('Failed to delete article:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete article'
            };
        }
    }

    /**
     * 软删除主题
     */
    async softDeleteTopic(id) {
        try {
            const isAuthenticated = await this.authenticate();
            if (!isAuthenticated) {
                throw new Error('Authentication required');
            }

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
     * 订阅机制
     */
    subscribe(callback) {
        this.articleSubscribers.add(callback);
        callback(this.currentArticles);
        this.startPeriodicFetch();
    }

    subscribeToTopics(callback) {
        this.topicSubscribers.add(callback);
        callback(this.currentTopics);
        this.fetchTopics().catch(console.error);
    }

    unsubscribe(callback) {
        this.articleSubscribers.delete(callback);
        if (this.articleSubscribers.size === 0 && this.topicSubscribers.size === 0) {
            this.stopPeriodicFetch();
        }
    }

    unsubscribeFromTopics(callback) {
        this.topicSubscribers.delete(callback);
        if (this.articleSubscribers.size === 0 && this.topicSubscribers.size === 0) {
            this.stopPeriodicFetch();
        }
    }

    notifyArticleSubscribers() {
        this.articleSubscribers.forEach(callback => {
            try {
                callback(this.currentArticles);
            } catch (error) {
                console.error('Article subscriber callback error:', error);
            }
        });
    }

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
     * 定期获取数据
     */
    async startPeriodicFetch() {
        if (this.fetchInterval) return;

        const fetchData = async () => {
            try {
                const isAuthenticated = await this.authenticate();
                if (!isAuthenticated) {
                    console.log('Periodic fetch skipped due to authentication failure');
                    return;
                }

                await Promise.all([
                    this.fetchArticles(),
                    this.fetchTopics()
                ]);
            } catch (error) {
                console.error('Periodic fetch error:', error);
            }
        };

        // 立即执行一次
        await fetchData();

        // 设置定时器
        this.fetchInterval = setInterval(fetchData, this.config.fetchInterval);
    }

    stopPeriodicFetch() {
        if (this.fetchInterval) {
            clearInterval(this.fetchInterval);
            this.fetchInterval = null;
        }
    }

    /**
     * 清理资源
     */
    destroy() {
        this.stopPeriodicFetch();
        this.articleSubscribers.clear();
        this.topicSubscribers.clear();
        this.currentArticles = staticArticles;
        this.currentTopics = staticTopics;
        this.pb.authStore.clear();
    }
}

// 创建服务实例
const wiseflowService = new WiseflowService({
    baseUrl: 'http://127.0.0.1:8090',
    adminEmail: 'songguocheng348@gmail.com',
    adminPassword: 'Ericsgc@119742',
    fetchInterval: 3600000 // 1 hour
});

export default wiseflowService;