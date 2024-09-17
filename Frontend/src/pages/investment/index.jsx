import React, { useState } from 'react';
import {
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    Box,
    ToggleButton,
    ToggleButtonGroup,
    CardActionArea,
    CardActions,
} from '@mui/material';
import { PlayCircleOutline, Language, Star, OpenInNew } from '@mui/icons-material';

const channels = [
    { id: 1, title: "Introduction to Personal Finance", rating: 4.5, image: "/placeholder.svg?height=200&width=300" },
    { id: 2, title: "Advanced Investment Strategies", rating: 4.8, image: "/placeholder.svg?height=200&width=300" },
    { id: 3, title: "Retirement Planning 101", rating: 4.3, image: "/placeholder.svg?height=200&width=300" },
];

const websites = [
    {
        id: 1,
        name: "InvestoPedia",
        url: "https://www.investopedia.com",
        description: "Comprehensive resource for investing education",
        content: "Investopedia is a leading source of financial content on the web, with more than 20 million unique visitors and 60 million page views each month. Powered by a team of data scientists and financial experts, Investopedia offers timely, trusted, and actionable financial information for every investor, from early investors to financial advisors to high net worth individuals.",
        image: "/placeholder.svg?height=300&width=600"
    },
    {
        id: 2,
        name: "MorningStar",
        url: "https://www.morningstar.com",
        description: "Investment research and management insights",
        content: "Morningstar, Inc. is a leading provider of independent investment research in North America, Europe, Australia, and Asia. The company offers an extensive line of products and services for individual investors, financial advisors, asset managers, retirement plan providers and sponsors, and institutional investors in the private capital markets.",
        image: "/placeholder.svg?height=300&width=600"
    },
    {
        id: 3,
        name: "The Motley Fool",
        url: "https://www.fool.com",
        description: "Stock market analysis and advice",
        content: "Founded in 1993 in Alexandria, VA., by brothers David and Tom Gardner, The Motley Fool is a multimedia financial-services company dedicated to building the world's greatest investment community. The company's name was taken from Shakespeare, whose wise fools both instructed and amused, and could speak the truth to the king without getting their heads lopped off.",
        image: "/placeholder.svg?height=300&width=600"
    },
];

const ChannelRecommendations = () => (
    <Grid container spacing={4}>
        {channels.map((channel) => (
            <Grid item xs={12} sm={6} md={4} key={channel.id}>
                <Card sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    '&:hover': {
                        boxShadow: 3,
                    },
                }}>
                    <CardMedia
                        component="img"
                        height="200"
                        image={channel.image}
                        alt={channel.title}
                    />
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Typography gutterBottom variant="h6" component="div">
                            {channel.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                                Rating: {channel.rating}
                            </Typography>
                            <Star color="primary" />
                        </Box>
                        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                            Watch Now
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
        ))}
    </Grid>
);

const WebsiteRecommendations = () => (
    <Grid container spacing={4}>
        {websites.map((website) => (
            <Grid item xs={12} key={website.id}>
                <Card sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    '&:hover': {
                        boxShadow: 3,
                    },
                }}>
                    <CardActionArea>
                        <CardMedia
                            component="img"
                            height="300"
                            image={website.image}
                            alt={website.name}
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h4" component="div">
                                {website.name}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {website.description}
                            </Typography>
                            <Typography variant="body1" color="text.primary" paragraph>
                                {website.content}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                    <CardActions>
                        <Button
                            size="large"
                            color="primary"
                            endIcon={<OpenInNew />}
                            href={website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Visit Website
                        </Button>
                    </CardActions>
                </Card>
            </Grid>
        ))}
    </Grid>
);

const InvestmentResources = () => {
    const [activeView, setActiveView] = useState('channels');

    const handleChange = (event, newValue) => {
        if (newValue !== null) {
            setActiveView(newValue);
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 4 }}>
                <ToggleButtonGroup
                    value={activeView}
                    exclusive
                    onChange={handleChange}
                    aria-label="resource type"
                    size="small"
                >
                    <ToggleButton value="channels" aria-label="channels">
                        <PlayCircleOutline sx={{ mr: 1 }} />
                        Channels
                    </ToggleButton>
                    <ToggleButton value="websites" aria-label="websites">
                        <Language sx={{ mr: 1 }} />
                        Websites
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            {activeView === 'channels' ? <ChannelRecommendations /> : <WebsiteRecommendations />}
        </Box>
    );
};

export default InvestmentResources;