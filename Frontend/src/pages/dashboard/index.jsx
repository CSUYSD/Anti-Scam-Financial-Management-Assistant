import React from 'react'
import {
    Typography,
    Container,
    Grid,
    Paper,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    useTheme,
} from '@mui/material'
import {
    AccountBalance as AccountBalanceIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

const weeklyData = [
    { day: 'Mon', income: 1000, expense: 800 },
    { day: 'Tue', income: 1500, expense: 1000 },
    { day: 'Wed', income: 1200, expense: 1100 },
    { day: 'Thu', income: 1800, expense: 1300 },
    { day: 'Fri', income: 2000, expense: 1500 },
    { day: 'Sat', income: 2200, expense: 1800 },
    { day: 'Sun', income: 1800, expense: 2000 },
]

const recentRecords = [
    { id: 1, description: 'Salary', amount: 5000, type: 'income' },
    { id: 2, description: 'Rent', amount: -1500, type: 'expense' },
    { id: 3, description: 'Groceries', amount: -200, type: 'expense' },
    { id: 4, description: 'Freelance work', amount: 1000, type: 'income' },
    { id: 5, description: 'Utilities', amount: -150, type: 'expense' },
]

const MotionPaper = motion(Paper)

const BalanceCard = ({ balance }) => {
    const theme = useTheme()
    return (
        <MotionPaper
            elevation={3}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                color: 'white',
                height: '100%',
                borderRadius: 4,
            }}
        >
            <AccountBalanceIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" component="div" gutterBottom>Current Balance</Typography>
            <Typography variant="h3" component="div">${balance.toLocaleString()}</Typography>
        </MotionPaper>
    )
}

const RecentRecordsList = ({ records }) => {
    const theme = useTheme()
    return (
        <MotionPaper
            elevation={3}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{ p: 3, borderRadius: 4 }}
        >
            <Typography variant="h6" gutterBottom>Recent Records</Typography>
            <List>
                {records.map((record, index) => (
                    <motion.div
                        key={record.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <ListItem>
                            <ListItemText
                                primary={record.description}
                                secondary={record.type === 'income' ? 'Income' : 'Expense'}
                            />
                            <Typography
                                variant="body2"
                                color={record.type === 'income' ? 'success.main' : 'error.main'}
                                sx={{ fontWeight: 'bold' }}
                            >
                                {record.type === 'income' ? '+' : '-'}${Math.abs(record.amount).toLocaleString()}
                            </Typography>
                        </ListItem>
                        {index < records.length - 1 && <Divider />}
                    </motion.div>
                ))}
            </List>
        </MotionPaper>
    )
}

const WeeklyChart = ({ data }) => {
    const theme = useTheme()
    return (
        <MotionPaper
            elevation={3}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            sx={{ p: 3, borderRadius: 4 }}
        >
            <Typography variant="h6" gutterBottom>Weekly Income/Expense</Typography>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="day" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <Tooltip
                        contentStyle={{
                            background: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: theme.shape.borderRadius,
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="income"
                        stroke={theme.palette.success.main}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Income"
                    />
                    <Line
                        type="monotone"
                        dataKey="expense"
                        stroke={theme.palette.error.main}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Expense"
                    />
                </LineChart>
            </ResponsiveContainer>
        </MotionPaper>
    )
}

export default function Dashboard() {
    const currentBalance = 10000
    const theme = useTheme()

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <BalanceCard balance={currentBalance} />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <WeeklyChart data={weeklyData} />
                    </Grid>
                    <Grid item xs={12}>
                        <RecentRecordsList records={recentRecords} />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}