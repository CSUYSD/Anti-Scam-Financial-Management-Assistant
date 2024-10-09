import React, { useState, useEffect } from 'react'
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
    Alert,
    AlertTitle,
    CircularProgress,
} from '@mui/material'
import {
    AccountBalance as AccountBalanceIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Warning as WarningIcon,
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { getRecentRecordsAPI } from '@/api/record'
import { getCurrentAccountAPI } from '@/api/account'

const weeklyData = [
    { day: 'Mon', income: 1000, expense: 800 },
    { day: 'Tue', income: 1500, expense: 1000 },
    { day: 'Wed', income: 1200, expense: 1100 },
    { day: 'Thu', income: 1800, expense: 1300 },
    { day: 'Fri', income: 2000, expense: 1500 },
    { day: 'Sat', income: 2200, expense: 1800 },
    { day: 'Sun', income: 1800, expense: 2000 },
]

const suspiciousTransactions = [
    { id: 1, description: 'Large withdrawal', amount: 5000, date: '2023-05-15' },
    { id: 2, description: 'Unusual overseas transfer', amount: 2000, date: '2023-05-14' },
]

const transactionTypes = [
    { name: 'Food & Dining', value: 30 },
    { name: 'Transportation', value: 20 },
    { name: 'Shopping', value: 15 },
    { name: 'Utilities', value: 10 },
    { name: 'Entertainment', value: 15 },
    { name: 'Others', value: 10 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']

const MotionPaper = motion(Paper)

const BalanceCard = ({ balance, income, expense }) => {
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
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #3f51b5, #9c27b0)',
                color: 'white',
                height: '100%',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: -50,
                    left: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                }}
            />
            <Box sx={{ textAlign: 'center', mb: 2, position: 'relative', zIndex: 1 }}>
                <AccountBalanceIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" component="div" gutterBottom>Current Balance</Typography>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                    ${balance.toLocaleString()}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 32, color: theme.palette.success.light }} />
                    <Typography variant="subtitle1">Income</Typography>
                    <Typography variant="h6" sx={{ color: theme.palette.success.light, fontWeight: 'bold' }}>
                        ${income.toLocaleString()}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <TrendingDownIcon sx={{ fontSize: 32, color: theme.palette.error.light }} />
                    <Typography variant="subtitle1">Expense</Typography>
                    <Typography variant="h6" sx={{ color: theme.palette.error.light, fontWeight: 'bold' }}>
                        ${expense.toLocaleString()}
                    </Typography>
                </Box>
            </Box>
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
            sx={{ p: 3, borderRadius: 4, height: '100%' }}
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
                                primary={record.transactionDescription}
                                secondary={record.type}
                            />
                            <Typography
                                variant="body2"
                                color={record.type === 'Income' ? 'success.main' : 'error.main'}
                                sx={{ fontWeight: 'bold' }}
                            >
                                {record.type === 'Income' ? '+' : '-'}${Math.abs(record.amount).toLocaleString()}
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
            sx={{ p: 3, borderRadius: 4, height: '100%' }}
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

const SuspiciousTransactions = ({ transactions }) => {
    const theme = useTheme()
    return (
        <MotionPaper
            elevation={3}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            sx={{ p: 3, borderRadius: 4, height: '100%' }}
        >
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                Suspicious Transactions
            </Typography>
            {transactions.length > 0 ? (
                <List>
                    {transactions.map((transaction, index) => (
                        <motion.div
                            key={transaction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <ListItem>
                                <ListItemText
                                    primary={transaction.description}
                                    secondary={`Date: ${transaction.date}`}
                                />
                                <Typography
                                    variant="body2"
                                    color="error.main"
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    ${transaction.amount.toLocaleString()}
                                </Typography>
                            </ListItem>
                            {index < transactions.length - 1 && <Divider />}
                        </motion.div>
                    ))}
                </List>
            ) : (
                <Alert severity="info">
                    <AlertTitle>No Suspicious Transactions</AlertTitle>
                    There are currently no suspicious transactions to report.
                </Alert>
            )}
        </MotionPaper>
    )
}

const TransactionTypesPieChart = ({ data }) => {
    const theme = useTheme()
    return (
        <MotionPaper
            elevation={3}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            sx={{ p: 3, borderRadius: 4, height: '100%' }}
        >
            <Typography variant="h6" gutterBottom>Transaction Types</Typography>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </MotionPaper>
    )
}

export default function Dashboard() {
    const [accountData, setAccountData] = useState(null)
    const [recentRecords, setRecentRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const theme = useTheme()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                // Fetch account data using the provided API
                const accountResponse = await getCurrentAccountAPI()
                setAccountData(accountResponse.data)

                // Fetch recent records
                const recordsResponse = await getRecentRecordsAPI()
                setRecentRecords(recordsResponse.data)

                setLoading(false)
            } catch (error) {
                console.error('Error fetching data:', error)
                setError('Failed to fetch data. Please try again later.')
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>
            </Box>
        )
    }

    const balance = accountData ? accountData.totalIncome - accountData.totalExpense : 0

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <BalanceCard
                            balance={balance}
                            income={accountData ? accountData.totalIncome : 0}
                            expense={accountData ? accountData.totalExpense : 0}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <WeeklyChart data={weeklyData} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <RecentRecordsList records={recentRecords} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SuspiciousTransactions transactions={suspiciousTransactions} />
                    </Grid>
                    <Grid item xs={12}>
                        <TransactionTypesPieChart data={transactionTypes} />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}