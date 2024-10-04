import React, { useState, useEffect } from 'react';
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
    Skeleton,
    Fade,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import { PlayCircleOutline, Language, Star, OpenInNew, Close } from '@mui/icons-material';

const channelsData = [
    {
        id: 1,
        title: "Introduction to Personal Finance",
        rating: 4.5,
        thumbnail: "https://i.ytimg.com/an_webp/Yzr1rlnZb0c/mqdefault_6s.webp?du=3000&sqp=CLqIpbcG&rs=AOn4CLBlr8sqTkN7kDwifwMKINqNa8dzVQ",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
        description: "Learn the basics of personal finance in this comprehensive introduction."
    },
    {
        id: 2,
        title: "Advanced Investment Strategies",
        rating: 4.8,
        thumbnail: "https://i.ytimg.com/an_webp/xQSiRfqn8Ao/mqdefault_6s.webp?du=3000&sqp=CIaYpbcG&rs=AOn4CLCHJ7HzB2kmZUf5m2rvrZ2MQmvkAg",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
        description: "Dive deep into advanced investment techniques and strategies."
    },
    {
        id: 3,
        title: "Retirement Planning 101",
        rating: 4.3,
        thumbnail: "https://i.ytimg.com/an_webp/63oF8BOMMB8/mqdefault_6s.webp?du=3000&sqp=CMqZpbcG&rs=AOn4CLDVUkL_kMM4ExL7AxPykGBdddSAGg",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
        description: "Prepare for your future with this comprehensive retirement planning guide."
    },
    {
        id: 4,
        title: "What's Coming Is WORSE Than a Recession\" - Jeremy Grantham's Last WARNING",
        rating: 4.3,
        thumbnail: "https://i.ytimg.com/an_webp/NF6W8T0XXbk/mqdefault_6s.webp?du=3000&sqp=CO7tpLcG&rs=AOn4CLCVu238WbCHH_nH-sRMgUIy4g6oFA",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
        description: "We own commercial licenses for all the content used in this video except parts about the topic that have been used under fair use and it was fully edited by us."
    },
];

const websitesData = [
    {
        id: 1,
        name: "InvestoPedia",
        url: "https://www.investopedia.com",
        description: "Comprehensive resource for investing education",
        content: "Investopedia is a leading source of financial content on the web, with more than 20 million unique visitors and 60 million page views each month. Powered by a team of data scientists and financial experts, Investopedia offers timely, trusted, and actionable financial information for every investor, from early investors to financial advisors to high net worth individuals.",
        image: "https://www.investopedia.com/thmb/FvDGwJ1kXQNpE2OgMfvyQFka-mQ=/600x320/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/News-Story-Federal-Reserve-Preview-FINAL-2-d4a7d4079433481e8a6611db4f040ca2.png"
    },
    {
        id: 2,
        name: "MorningStar",
        url: "https://www.morningstar.com",
        description: "Investment research and management insights",
        content: "Morningstar, Inc. is a leading provider of independent investment research in North America, Europe, Australia, and Asia. The company offers an extensive line of products and services for individual investors, financial advisors, asset managers, retirement plan providers and sponsors, and institutional investors in the private capital markets.",
        image: "https://morningstar-morningstar-prod.web.arc-cdn.net/resizer/ctqH0aBmci_uctA1YXSQawFkoNU=/640x360/smart/filters:no_upscale():quality(80)/cloudfront-us-east-1.images.arcpublishing.com/morningstar/GJMQNPFPOFHUHHT3UABTAMBTZM.png"
    },
    {
        id: 3,
        name: "The Motley Fool",
        url: "https://www.fool.com",
        description: "Stock market analysis and advice",
        content: "Founded in 1993 in Alexandria, VA., by brothers David and Tom Gardner, The Motley Fool is a multimedia financial-services company dedicated to building the world's greatest investment community. The company's name was taken from Shakespeare, whose wise fools both instructed and amused, and could speak the truth to the king without getting their heads lopped off.",
        image: "https://g.foolcdn.com/misc-assets/wf-large-1-oct20.png"
    },
];

const ChannelRecommendations = () => {
    const [openVideo, setOpenVideo] = useState(null);

    const handleOpenVideo = (video) => {
        setOpenVideo(video);
    };

    const handleCloseVideo = () => {
        setOpenVideo(null);
    };

    return (
        <>
            <Grid container spacing={4}>
                {channelsData.map((channel) => (
                    <Grid item xs={12} sm={6} md={4} key={channel.id}>
                        <Card sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            '&:hover': {
                                boxShadow: 3,
                                transform: 'translateY(-5px)',
                                transition: 'all 0.3s ease-in-out',
                            },
                        }}>
                            <CardActionArea onClick={() => handleOpenVideo(channel)}>
                                <CardMedia
                                    component="img"
                                    height="180"
                                    image={channel.thumbnail}
                                    alt={channel.title}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h6" component="div">
                                        {channel.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {channel.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                                            Rating: {channel.rating}
                                        </Typography>
                                        <Star color="primary" />
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                            <CardActions>
                                <Button size="small" color="primary" onClick={() => handleOpenVideo(channel)}>
                                    Watch Now
                                </Button>
                                <Button size="small" color="primary" href={channel.videoUrl.replace('?autoplay=1', '')} target="_blank" rel="noopener noreferrer">
                                    Watch on YouTube
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Dialog
                open={openVideo !== null}
                onClose={handleCloseVideo}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {openVideo?.title}
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseVideo}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
                        <iframe
                            src={openVideo?.videoUrl}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none',
                            }}
                            allowFullScreen
                            allow="autoplay"
                            title={openVideo?.title}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

const WebsiteRecommendations = ({ websites, isLoading }) => (
    <Grid container spacing={4}>
        {isLoading ? (
            Array.from(new Array(3)).map((_, index) => (
                <Grid item xs={12} key={index}>
                    <Card sx={{ display: 'flex', height: '100%' }}>
                        <Skeleton variant="rectangular" width={300} height={200} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 2 }}>
                            <Skeleton variant="text" width="60%" height={40} />
                            <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
                            <Skeleton variant="text" width="100%" height={20} />
                            <Skeleton variant="text" width="100%" height={20} />
                            <Skeleton variant="text" width="80%" height={20} />
                        </Box>
                    </Card>
                </Grid>
            ))
        ) : (
            websites.map((website) => (
                <Grid item xs={12} key={website.id}>
                    <Fade in={true} timeout={500}>
                        <Card sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            height: '100%',
                            '&:hover': {
                                boxShadow: 3,
                                transform: 'translateY(-5px)',
                                transition: 'all 0.3s ease-in-out',
                            },
                        }}>
                            <CardMedia
                                component="img"
                                sx={{
                                    width: { xs: '100%', md: 300 },
                                    height: { xs: 200, md: 'auto' },
                                    objectFit: 'cover',
                                }}
                                image={website.image}
                                alt={website.name}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
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
                                <CardActions sx={{ mt: 'auto' }}>
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
                            </Box>
                        </Card>
                    </Fade>
                </Grid>
            ))
        )}
    </Grid>
);

const InvestmentResources = () => {
    const [activeView, setActiveView] = useState('channels');
    const [websites, setWebsites] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeView === 'websites') {
            fetchWebsites();
        }
    }, [activeView]);

    const fetchWebsites = async () => {
        setIsLoading(true);
        // Simulating API call delay
        setTimeout(() => {
            setWebsites(websitesData);
            setIsLoading(false);
        }, 1000);
    };

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
            {activeView === 'channels' ?
                <ChannelRecommendations /> :
                <WebsiteRecommendations websites={websites} isLoading={isLoading} />
            }
        </Box>
    );
};

export default InvestmentResources;