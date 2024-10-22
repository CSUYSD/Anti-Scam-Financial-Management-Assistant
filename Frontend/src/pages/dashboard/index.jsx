import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Sector, Cell, AreaChart, Area } from 'recharts';
import { AccountBalance, TrendingUp, TrendingDown, Warning, Savings, List, ArrowUpward, ArrowDownward, Search, Refresh, MoreVert, Info } from '@mui/icons-material';
import { getRecentRecordsAPI, getAllRecordsAPI } from '@/api/record';
import { getCurrentAccountAPI } from '@/api/account';
import { format, subDays } from 'date-fns';
// @ts-ignore
import webSocket from '@/hooks/WebSocket.jsx';


const INCOME_COLORS = [
    '#7986CB',
    '#EF5350',
    '#F06292',
    '#FFF176',
    '#D4E157',
    '#FFD54F',
    '#81C784',
    '#AED581'
];


const EXPENSE_COLORS = [
    '#9575CD',
    '#7986CB',
    '#FFF176',
    '#D4E157',
    '#FFD54F',
    '#81C784',
    '#EF5350',
    '#F06292',
    '#BA68C8'
];




export default function Dashboard() {
    const [accountData, setAccountData] = useState({ totalIncome: 0, totalExpense: 0, id: '' });
    const [recentRecords, setRecentRecords] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [transactionTypes, setTransactionTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartDuration, setChartDuration] = useState(7);
    const [savingsGoal, setSavingsGoal] = useState(10000);
    const [suspiciousTransactions, setSuspiciousTransactions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const webSocketMessage = webSocket();


    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const accountResponse = await getCurrentAccountAPI();
            setAccountData(accountResponse.data);


            const recentRecordsResponse = await getRecentRecordsAPI(30);
            setRecentRecords(recentRecordsResponse.data);


            const processedChartData = processChartData(recentRecordsResponse.data);
            setChartData(processedChartData);


            const allRecordsResponse = await getAllRecordsAPI();
            const processedTransactionTypes = processTransactionTypes(allRecordsResponse.data);
            setTransactionTypes(processedTransactionTypes);


            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data. Please try again later.');
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchData();
    }, [fetchData]);


    useEffect(() => {
        if (webSocketMessage) {
            setSuspiciousTransactions(prevTransactions =>
                [webSocketMessage, ...prevTransactions].slice(0, 5)
            );
        }
    }, [webSocketMessage]);

    useEffect(() => {
        const storedTransactions = JSON.parse(sessionStorage.getItem('suspiciousTransactions') || '[]');
        setSuspiciousTransactions(storedTransactions);
    }, []);



    const processChartData = useCallback((records) => {
        const dailyData = {};
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 29);


        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            dailyData[dateStr] = { date: dateStr, income: 0, expense: 0, balance: 0 };
        }


        let runningBalance = 0;
        records.forEach(record => {
            const date = record.transactionTime.split('T')[0];
            if (dailyData[date]) {
                if (record.type === 'Income') {
                    dailyData[date].income += record.amount;
                    runningBalance += record.amount;
                } else {
                    dailyData[date].expense += record.amount;
                    runningBalance -= record.amount;
                }
                dailyData[date].balance = runningBalance;
            }
        });


        return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, []);


    const processTransactionTypes = useCallback((records, duration = 30) => {
        const categories = {};
        const startDate = subDays(new Date(), duration - 1);


        records.forEach(record => {
            const recordDate = new Date(record.transactionTime);
            if (recordDate >= startDate) {
                if (!categories[record.category]) {
                    categories[record.category] = { name: record.category, value: 0, type: record.type };
                }
                categories[record.category].value += record.amount;
            }
        });


        return Object.values(categories);
    }, []);


    const handleDurationChange = useCallback((newDuration) => {
        setChartDuration(newDuration);
        setTransactionTypes(processTransactionTypes(recentRecords, newDuration));
    }, [recentRecords, processTransactionTypes]);


    const handleSavingsGoalChange = useCallback((newGoal) => {
        setSavingsGoal(newGoal);
    }, []);


    const BalanceCard = useMemo(() => ({balance, income, expense}) => {
        const controls = useAnimation();
        useEffect(() => {
            controls.start({
                scale: [1, 1.05, 1],
                transition: { duration: 0.5 },
            });
        }, [balance, controls]);


        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white col-span-2 h-full relative overflow-hidden"
            >
                <motion.div
                    className="absolute inset-0 bg-white opacity-10"
                    animate={{
                        scale: [1, 1.5, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 10,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                />
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold">Current Balance</h3>
                        <AccountBalance className="text-4xl" />
                    </div>
                    <motion.p
                        className="text-4xl font-bold mb-4"
                        animate={controls}
                    >
                        ${balance.toLocaleString()}
                    </motion.p>
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            className="bg-white bg-opacity-20 rounded-lg p-3"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <TrendingUp className="text-green-300" />
                                <ArrowUpward className="text-green-300" />
                            </div>
                            <p className="text-sm">Income</p>
                            <p className="text-lg font-semibold">${income.toLocaleString()}</p>
                        </motion.div>
                        <motion.div
                            className="bg-white bg-opacity-20 rounded-lg p-3"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <TrendingDown className="text-red-300" />
                                <ArrowDownward className="text-red-300" />
                            </div>
                            <p className="text-sm">Expense</p>
                            <p className="text-lg font-semibold">${expense.toLocaleString()}</p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        );
    }, []);




    const WeeklyChart = React.memo(({ data, duration, onDurationChange }) => {
        const [hoveredData, setHoveredData] = useState(null);


        const CustomTooltip = ({ active, payload, label }) => {
            if (active && payload && payload.length) {
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="bg-white p-4 rounded-lg shadow-lg border border-gray-200"
                    >
                        <p className="font-semibold text-gray-800">{format(new Date(label), 'MMM d, yyyy')}</p>
                        {payload.map((entry, index) => (
                            <p key={index} className={`text-sm ${entry.name === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: ${entry.value.toLocaleString()}
                            </p>
                        ))}
                    </motion.div>
                );
            }
            return null;
        };


        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6 col-span-4 h-full"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800">Income/Expense Chart</h3>
                    <div className="flex space-x-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDurationChange(7)}
                            className={`px-4 py-2 rounded-full ${duration === 7 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            7 Days
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDurationChange(30)}
                            className={`px-4 py-2 rounded-full ${duration === 30 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            30 Days
                        </motion.button>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data.slice(-duration)} onMouseMove={(data) => setHoveredData(data.activePayload?.[0]?.payload)}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => format(new Date(value), 'MMM d')}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="income" stroke="#10B981" fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="expense" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                </ResponsiveContainer>
                <AnimatePresence>
                    {hoveredData && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="mt-4 bg-gray-100 rounded-lg overflow-hidden"
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="p-4"
                            >
                                <motion.p
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className="font-semibold"
                                >
                                    Date: {format(new Date(hoveredData.date), 'MMMM d, yyyy')}
                                </motion.p>
                                <motion.p
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="text-green-600"
                                >
                                    Income: ${hoveredData.income.toLocaleString()}
                                </motion.p>
                                <motion.p
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                    className="text-red-600"
                                >
                                    Expense: ${hoveredData.expense.toLocaleString()}
                                </motion.p>
                                <motion.p
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.7 }}
                                    className="font-semibold mt-2"
                                >
                                    Balance: ${(hoveredData.income - hoveredData.expense).toLocaleString()}
                                </motion.p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    });




    const TransactionTypesPieChart = ({ data }) => {
        const [activeIndex, setActiveIndex] = useState(0);
        const [activeType, setActiveType] = useState('expense');


        const onPieEnter = useCallback((_, index) => {
            setActiveIndex(index);
        }, []);


        const processedData = useMemo(() => {
            const incomeData = data.filter(item => item.type === 'Income');
            const expenseData = data.filter(item => item.type === 'Expense');
            return { income: incomeData, expense: expenseData };
        }, [data]);


        const renderActiveShape = (props) => {
            const RADIAN = Math.PI / 180;
            const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
                fill, payload, percent, value } = props;
            const sin = Math.sin(-RADIAN * midAngle);
            const cos = Math.cos(-RADIAN * midAngle);
            const sx = cx + (outerRadius + 10) * cos;
            const sy = cy + (outerRadius + 10) * sin;
            const mx = cx + (outerRadius + 30) * cos;
            const my = cy + (outerRadius + 30) * sin;
            const ex = mx + (cos >= 0 ? 1 : -1) * 22;
            const ey = my;
            const textAnchor = cos >= 0 ? 'start' : 'end';


            return (
                <g>
                    <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                        {payload.name}
                    </text>
                    <Sector
                        cx={cx}
                        cy={cy}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        fill={fill}
                    />
                    <Sector
                        cx={cx}
                        cy={cy}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        innerRadius={outerRadius + 6}
                        outerRadius={outerRadius + 10}
                        fill={fill}
                    />
                    <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                    <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`$${value.toLocaleString()}`}</text>
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                        {`(${(percent * 100).toFixed(2)}%)`}
                    </text>
                </g>
            );
        };


        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-6 col-span-3 h-full"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800">Transaction Types</h3>
                    <div className="flex space-x-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveType('expense')}
                            className={`px-4 py-2 rounded-full ${activeType === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Expenses
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveType('income')}
                            className={`px-4 py-2 rounded-full ${activeType === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Income
                        </motion.button>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={processedData[activeType]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                        >
                            {processedData[activeType].map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={activeType === 'income' ? INCOME_COLORS[index % INCOME_COLORS.length] : EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="mt-4">
                    {processedData[activeType].map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center mb-2">
                            <div
                                className="w-4 h-4 mr-2"
                                style={{ backgroundColor: activeType === 'income' ? INCOME_COLORS[index % INCOME_COLORS.length] : EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}
                            ></div>
                            <span>{entry.name}: ${entry.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    };


    const SavingsGoalWidget = useMemo(() => ({ records, goal, onGoalChange }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [newGoal, setNewGoal] = useState(goal);
        const [progress, setProgress] = useState(0);
        const [showNotification, setShowNotification] = useState(false);
        const [notificationMessage, setNotificationMessage] = useState('');
        const [notificationColor, setNotificationColor] = useState('');


        useEffect(() => {
            const totalSavings = records.reduce((sum, record) => {
                return record.type === 'Income' ? sum + record.amount : sum - record.amount;
            }, 0);
            const calculatedProgress = Math.min((totalSavings / goal) * 100, 100);


            setProgress(0);
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= calculatedProgress) {
                        clearInterval(interval);
                        if (calculatedProgress >= 100) {
                            setNotificationMessage("🎉 Congratulations! You've reached your savings goal!");
                            setNotificationColor('bg-green-500');
                        } else if (calculatedProgress === 0) {
                            setNotificationMessage("💪 You're just starting out. Keep pushing towards your goal!");
                            setNotificationColor('bg-yellow-500');
                        } else if (calculatedProgress >= 50) {
                            setNotificationMessage("👍 You're halfway there! Keep it up!");
                            setNotificationColor('bg-blue-500');
                        }
                        setShowNotification(true);
                        return calculatedProgress;
                    }
                    return prev + 1;
                });
            }, 20);
            return () => clearInterval(interval);
        }, [records, goal]);


        useEffect(() => {
            if (showNotification) {
                const timer = setTimeout(() => {
                    setShowNotification(false);
                }, 5000);
                return () => clearTimeout(timer);
            }
        }, [showNotification]);


        const handleSave = () => {
            onGoalChange(newGoal);
            setIsEditing(false);
        };


        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-6 col-span-3 relative overflow-hidden"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800">Savings Goal</h3>
                    <Savings className="text-blue-500 text-3xl" />
                </div>
                <div className="flex flex-col items-center mb-4">
                    <div className="relative w-48 h-48 mb-4">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#e0e0e0"
                                strokeWidth="10"
                            />
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="10"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: progress / 100 }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                            />
                        </svg>
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                        >
                            <span className="text-4xl font-bold text-blue-500">{progress.toFixed(0)}%</span>
                        </motion.div>
                    </div>
                    <motion.p
                        className="text-lg text-gray-600 mb-4"
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                        ${(goal * progress / 100).toLocaleString()} / ${goal.toLocaleString()}
                    </motion.p>
                </div>
                {isEditing ? (
                    <div className="flex items-center justify-center mb-4">
                        <input
                            type="number"
                            value={newGoal}
                            onChange={(e) => setNewGoal(Number(e.target.value))}
                            className="border rounded-l px-3 py-2 w-32"
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
                        >
                            Save
                        </motion.button>
                    </div>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 mb-4"
                    >
                        Edit Goal
                    </motion.button>
                )}
                <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-2">Savings Tips</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                        <li>Set up automatic transfers to your savings account</li>
                        <li>Cut unnecessary expenses and redirect the money to savings</li>
                        <li>Look for ways to increase your income and save the extra money</li>
                        <li>Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
                    </ul>
                </div>
                <AnimatePresence>
                    {showNotification && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ duration: 0.5 }}
                            className={`absolute bottom-0 left-0 right-0 p-4 ${notificationColor} text-white text-center`}
                        >
                            {notificationMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.div
                    className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full"
                    style={{ filter: 'blur(40px)' }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.2, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatType: 'reverse',
                    }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-24 h-24 bg-green-100 rounded-full"
                    style={{ filter: 'blur(30px)' }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: 'reverse',
                    }}
                />
            </motion.div>
        );
    }, []);


    const TransactionList = useMemo(() => ({ title, transactions, icon }) => {
        const [expandedTransaction, setExpandedTransaction] = useState(null);


        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-2xl shadow-xl p-6 col-span-3"
            >
                <div className="flex items-center mb-4">
                    {icon}
                    <h3 className="text-2xl font-semibold text-gray-800 ml-2">{title}</h3>
                </div>
                <ul className="space-y-3 overflow-y-auto" style={{ maxHeight: '300px' }}>
                    <AnimatePresence>
                        {transactions.map((transaction, index) => (
                            <motion.li
                                key={transaction.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className="bg-gray-50 p-3 rounded-lg"
                            >
                                <div
                                    className="flex justify-between items-center cursor-pointer"
                                    onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{transaction.transactionDescription || transaction.description}</p>
                                        <p className="text-sm text-gray-500">{transaction.date || transaction.transactionTime.split('T')[0]}</p>
                                    </div>
                                    <motion.p
                                        className={`font-bold ${transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}
                                        initial={{ scale: 0.5 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                    >
                                        {transaction.type === 'Income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                                    </motion.p>
                                </div>
                                <AnimatePresence>
                                    {expandedTransaction === transaction.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="mt-2 text-sm text-gray-600"
                                        >
                                            <p>Category: {transaction.category}</p>
                                            <p>Account: {transaction.accountName}</p>
                                            {transaction.notes && <p>Notes: {transaction.notes}</p>}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            </motion.div>
        );
    }, []);


    const SuspiciousTransactions = useMemo(() => ({ transactions }) => {
        console.log('Rendering SuspiciousTransactions with:', transactions);
        const [isLoading, setIsLoading] = useState(false);
        const [suspiciousTransactions, setSuspiciousTransactions] = useState([]);


        const loadTransactions = useCallback(() => {
            setIsLoading(true);
            // 从 sessionStorage 获取交易
            const storedTransactions = JSON.parse(sessionStorage.getItem('suspiciousTransactions') || '[]');
            setSuspiciousTransactions(storedTransactions);
            setIsLoading(false);
        }, []);


        useEffect(() => {
            loadTransactions();
        }, [loadTransactions]);


        useEffect(() => {
            // 当传入的 transactions 更新时，更新组件状态
            setSuspiciousTransactions(transactions);
        }, [transactions]);


        const handleReload = () => {
            loadTransactions();
        };


        const formatDescription = (description) => {
            return description.replace(/^WARNING:\s*/i, '').trim();
        };


        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-2xl shadow-xl p-6 col-span-3"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <Warning className="text-yellow-500 text-3xl mr-2" />
                        <h3 className="text-2xl font-semibold text-gray-800">Suspicious Transactions</h3>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReload}
                        disabled={isLoading}
                        className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 flex items-center"
                    >
                        <Refresh className="mr-2" />
                        {isLoading ? 'Loading...' : 'Reload'}
                    </motion.button>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <motion.div
                            animate={{
                                rotate: 360,
                            }}
                            transition={{
                                loop: Infinity,
                                ease: "linear",
                                duration: 1,
                            }}
                            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                        />
                    </div>
                ) : (
                    <ul className="space-y-3 overflow-y-auto" style={{ maxHeight: '300px' }}>
                        <AnimatePresence>
                            {suspiciousTransactions.map((transaction, index) => (
                                <motion.li
                                    key={transaction.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className={`flex justify-between items-center p-3 rounded-lg ${
                                        transaction.risk === 'high' ? 'bg-yellow-100' : 'bg-green-100'
                                    }`}
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {transaction.risk === 'high' && '⚠️ '}
                                            {formatDescription(transaction.description)}
                                        </p>
                                        <p className="text-sm text-gray-500">{transaction.date}</p>
                                        <p className={`text-xs font-semibold ${
                                            transaction.risk === 'high' ? 'text-yellow-500' : 'text-green-500'
                                        }`}>
                                            Risk: {transaction.risk}
                                        </p>
                                    </div>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                )}
            </motion.div>
        );
    }, []);


    const InfoModal = ({ isOpen, onClose, transaction }) => {
        if (!isOpen || !transaction) return null;


        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="bg-white p-6 rounded-lg max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-2xl font-bold mb-4">Transaction Details</h2>
                    <p><strong>Description:</strong> {transaction.description}</p>
                    <p><strong>Amount:</strong> ${transaction.amount.toLocaleString()}</p>
                    <p><strong>Date:</strong> {transaction.date}</p>
                    <p><strong>Risk Level:</strong> {transaction.risk}</p>
                    <p><strong>Category:</strong> {transaction.category || 'N/A'}</p>
                    <p><strong>Account:</strong> {transaction.accountName || 'N/A'}</p>
                    <p><strong>Notes:</strong> {transaction.notes || 'N/A'}</p>
                    <div className="mt-6 flex justify-end">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                        >
                            Close
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        );
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <motion.div
                    animate={{
                        rotate: 360,
                    }}
                    transition={{
                        loop: Infinity,
                        ease: "linear",
                        duration: 1,
                    }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }


    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500 text-xl">{error}</p>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-6 gap-6">
                    <BalanceCard
                        balance={accountData.totalIncome - accountData.totalExpense}
                        income={accountData.totalIncome}
                        expense={accountData.totalExpense}
                    />
                    <WeeklyChart
                        data={chartData}
                        duration={chartDuration}
                        onDurationChange={handleDurationChange}
                    />
                    <TransactionTypesPieChart data={transactionTypes} />
                    <SavingsGoalWidget
                        records={recentRecords}
                        goal={savingsGoal}
                        onGoalChange={handleSavingsGoalChange}
                    />
                    <TransactionList
                        title="Recent Transactions"
                        transactions={recentRecords}
                        icon={<List className="text-blue-500 text-3xl" />}
                    />
                    <SuspiciousTransactions
                        transactions={suspiciousTransactions}
                    />
                </div>
            </div>
            <InfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                transaction={selectedTransaction}
            />
        </div>
    );
}

