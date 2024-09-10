import React from 'react'
import { BarChart, DollarSign, ShoppingCart } from 'lucide-react'

const Chart = () => (
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <BarChart className="h-32 w-32 text-blue-500" />
        <span className="ml-4 text-lg font-semibold">Chart Placeholder</span>
    </div>
)

const Deposits = () => (
    <div className="h-full flex flex-col justify-between">
        <div>
            <h2 className="text-xl font-semibold mb-2">Recent Deposits</h2>
            <p className="text-3xl font-bold">$3,024.00</p>
            <p className="text-gray-500">on 15 March, 2024</p>
        </div>
        <a href="#" className="text-blue-500 hover:text-blue-700 transition-colors duration-200">
            View balance
        </a>
    </div>
)

const Orders = () => (
    <div>
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <table className="w-full">
            <thead>
            <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Ship To</th>
                <th className="px-4 py-2 text-left">Payment Method</th>
                <th className="px-4 py-2 text-left">Sale Amount</th>
            </tr>
            </thead>
            <tbody>
            {[
                { date: '16 Mar, 2024', name: 'Elvis Presley', shipTo: 'Tupelo, MS', paymentMethod: 'VISA ⠀•••• 3719', amount: 312.44 },
                { date: '16 Mar, 2024', name: 'Paul McCartney', shipTo: 'London, UK', paymentMethod: 'VISA ⠀•••• 2574', amount: 866.99 },
                { date: '16 Mar, 2024', name: 'Tom Scholz', shipTo: 'Boston, MA', paymentMethod: 'MC ⠀•••• 1253', amount: 100.81 },
                { date: '16 Mar, 2024', name: 'Michael Jackson', shipTo: 'Gary, IN', paymentMethod: 'AMEX ⠀•••• 2000', amount: 654.39 },
                { date: '15 Mar, 2024', name: 'Bruce Springsteen', shipTo: 'Long Branch, NJ', paymentMethod: 'VISA ⠀•••• 5919', amount: 212.79 },
            ].map((order, index) => (
                <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-2">{order.date}</td>
                    <td className="px-4 py-2">{order.name}</td>
                    <td className="px-4 py-2">{order.shipTo}</td>
                    <td className="px-4 py-2">{order.paymentMethod}</td>
                    <td className="px-4 py-2">${order.amount.toFixed(2)}</td>
                </tr>
            ))}
            </tbody>
        </table>
        <div className="mt-4">
            <a href="#" className="text-blue-500 hover:text-blue-700 transition-colors duration-200">
                See more orders
            </a>
        </div>
    </div>
)

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="w-full max-w-7xl mx-auto">
                <h1 className="text-3xl font-semibold mb-8">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Sales Chart</h2>
                            <Chart />
                        </div>
                    </div>
                    <div>
                        <div className="bg-white rounded-lg shadow-lg p-6 h-full">
                            <Deposits />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <Orders />
                </div>
            </div>
        </div>
    )
}