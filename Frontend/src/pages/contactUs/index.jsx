import React, { useState, useCallback } from 'react';
import {
    Typography,
    Container,
    Grid,
    TextField,
    Button,
    Paper,
    Box,
    useTheme,
    useMediaQuery,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon
} from '@mui/icons-material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { gapi } from 'gapi-script';

// Define libraries as a constant outside the component
const libraries = ["places"];

const ContactUs = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const mapContainerStyle = {
        width: '100%',
        height: isMobile ? '300px' : '450px'
    };

    const center = {
        lat: -33.8882,
        lng: 151.1871
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await sendEmail(formData);
            setSnackbar({
                open: true,
                message: 'Email sent successfully!',
                severity: 'success'
            });
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Error sending email:', error);
            setSnackbar({
                open: true,
                message: 'Failed to send email. Please try again.',
                severity: 'error'
            });
        }
    };

    const sendEmail = useCallback(async (data) => {
        const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
        const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
        const SCOPES = 'https://www.googleapis.com/auth/gmail.send';

        try {
            await new Promise((resolve, reject) => {
                gapi.load('client:auth2', async () => {
                    try {
                        await gapi.client.init({
                            apiKey: API_KEY,
                            clientId: CLIENT_ID,
                            discoveryDocs: [DISCOVERY_DOC],
                            scope: SCOPES,
                        });

                        const authInstance = gapi.auth2.getAuthInstance();
                        if (!authInstance.isSignedIn.get()) {
                            await authInstance.signIn();
                        }

                        const message = `From: ${data.name} <${data.email}>\r\n` +
                            `To: recipient@example.com\r\n` +
                            `Subject: ${data.subject}\r\n\r\n` +
                            `${data.message}`;

                        const encodedMessage = btoa(message)
                            .replace(/\+/g, '-')
                            .replace(/\//g, '_')
                            .replace(/=+$/, '');

                        await gapi.client.gmail.users.messages.send({
                            userId: 'me',
                            resource: {
                                raw: encodedMessage
                            }
                        });

                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.error('Error in sendEmail:', error);
            throw error;
        }
    }, []);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom component="h1" sx={{ mb: 4 }}>
                Contact Us
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            height: '100%',
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Send us a message
                        </Typography>
                        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Name"
                                variant="outlined"
                                margin="normal"
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                margin="normal"
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            <TextField
                                fullWidth
                                label="Subject"
                                variant="outlined"
                                margin="normal"
                                required
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                            />
                            <TextField
                                fullWidth
                                label="Message"
                                variant="outlined"
                                margin="normal"
                                required
                                multiline
                                rows={4}
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                type="submit"
                                sx={{ mt: 2 }}
                            >
                                Send Message
                            </Button>
                        </form>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            height: '100%',
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Contact Information
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <EmailIcon sx={{ mr: 2 }} />
                                <Typography variant="body1">
                                    support@example.com
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <PhoneIcon sx={{ mr: 2 }} />
                                <Typography variant="body1">
                                    +61 2 9351 2222
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationIcon sx={{ mr: 2 }} />
                                <Typography variant="body1">
                                    The University of Sydney<br />
                                    Camperdown NSW 2006<br />
                                    Australia
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            mt: 3,
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Find Us
                        </Typography>
                        <LoadScript
                            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                            libraries={libraries}
                        >
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={center}
                                zoom={15}
                                options={{
                                    styles: theme.palette.mode === 'dark' ? [
                                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                                    ] : [],
                                }}
                            >
                                <Marker position={center} />
                            </GoogleMap>
                        </LoadScript>
                    </Paper>
                </Grid>
            </Grid>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ContactUs;