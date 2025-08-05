"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, Filter, ChevronLeft, ChevronRight, Link, Box, ArrowLeftIcon, X, IndianRupee, Edit } from 'lucide-react';
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useRouter } from 'next/navigation';

// TypeScript interfaces
interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    timestamp: number;
    createdAt: Date;
}

interface MonthlyReport {
    month: string;
    year: number;
    income: number;
    expense: number;
    balance: number;
    transactionCount: number;
}

interface YearlyReport {
    year: number;
    income: number;
    expense: number;
    balance: number;
    months: MonthlyReport[];
}

const IncomeExpense: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [description, setDescription] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'income' | 'expense'>('income');
    const [loading, setLoading] = useState<boolean>(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    // Filter states
    const [viewMode, setViewMode] = useState<'overview' | 'monthly' | 'yearly'>('overview');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

    // Calculate totals
    const income: number = transactions
        .filter((t: Transaction) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const expenses: number = transactions
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const balance: number = income - expenses;

    // Get available years from transactions
    const availableYears = Array.from(new Set(
        transactions.map(t => new Date(t.date).getFullYear())
    )).sort((a, b) => b - a);

    // Firebase listener for real-time updates
    useEffect(() => {
        const transactionsRef = collection(db, 'incomeexpense');
        const q = query(transactionsRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const transactionData: Transaction[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                transactionData.push({
                    id: doc.id,
                    description: data.description,
                    amount: data.amount,
                    type: data.type,
                    date: data.date,
                    timestamp: data.timestamp,
                    createdAt: data.createdAt?.toDate() || new Date(data.date)
                });
            });
            setTransactions(transactionData);
        }, (error) => {
            console.error('Error fetching transactions:', error);
        });

        return () => unsubscribe();
    }, []);

    // Filter transactions based on view mode
    useEffect(() => {
        let filtered = [...transactions];

        if (viewMode === 'monthly') {
            filtered = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getFullYear() === selectedYear &&
                    transactionDate.getMonth() === selectedMonth;
            });
        } else if (viewMode === 'yearly') {
            filtered = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getFullYear() === selectedYear;
            });
        }

        setFilteredTransactions(filtered.sort((a, b) => b.timestamp - a.timestamp));
    }, [transactions, viewMode, selectedYear, selectedMonth]);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!description.trim() || !amount || parseFloat(amount) <= 0 || !transactionDate) return;

        // If editing existing transaction
        if (editingTransaction) {
            try {
                await updateDoc(doc(db, 'incomeexpense', editingTransaction.id), {
                    description: description.trim(),
                    amount: parseFloat(amount),
                    type,
                    date: new Date(transactionDate).toISOString(),
                    timestamp: new Date(transactionDate).getTime()
                });
                setEditingTransaction(null);
                setDescription('');
                setAmount('');
                setTransactionDate(new Date().toISOString().split('T')[0]);
                setType('income');
                return;
            } catch (error) {
                console.error('Error updating transaction:', error);
                alert('Failed to update transaction. Please try again.');
                return;
            }
        }

        setLoading(true);
        try {
            const selectedDate = new Date(transactionDate);
            const newTransaction = {
                description: description.trim(),
                amount: parseFloat(amount),
                type,
                date: selectedDate.toISOString(),
                timestamp: selectedDate.getTime(),
                createdAt: Timestamp.fromDate(selectedDate)
            };

            // Add to Firestore under 'incomeexpense' collection
            await addDoc(collection(db, 'incomeexpense'), newTransaction);

            // Reset form
            setDescription('');
            setAmount('');
            setTransactionDate(new Date().toISOString().split('T')[0]);
        } catch (error) {
            console.error('Error adding transaction:', error);
            alert('Failed to add transaction. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: string): void => {
        setTransactionToDelete(id);
        setShowDeleteConfirm(true);
    };

    const handleEditClick = (transaction: Transaction): void => {
        setEditingTransaction(transaction);
        setDescription(transaction.description);
        setAmount(transaction.amount.toString());
        setTransactionDate(transaction.date.split('T')[0]);
        setType(transaction.type);
        // Scroll to form
        document.getElementById('transaction-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelEdit = (): void => {
        setEditingTransaction(null);
        setDescription('');
        setAmount('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
        setType('income');
    };

    const deleteTransaction = async (): Promise<void> => {
        if (!transactionToDelete) return;

        try {
            await deleteDoc(doc(db, 'incomeexpense', transactionToDelete));
            setShowDeleteConfirm(false);
            setTransactionToDelete(null);
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Failed to delete transaction. Please try again.');
            setShowDeleteConfirm(false);
            setTransactionToDelete(null);
        }
    };

    const cancelDelete = (): void => {
        setShowDeleteConfirm(false);
        setTransactionToDelete(null);
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getMonthName = (monthIndex: number): string => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[monthIndex];
    };

    const getMonthlyReport = (): MonthlyReport[] => {
        const reports: { [key: string]: MonthlyReport } = {};

        transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            const year = transactionDate.getFullYear();
            const month = transactionDate.getMonth();
            const key = `${year}-${month}`;

            if (!reports[key]) {
                reports[key] = {
                    month: getMonthName(month),
                    year,
                    income: 0,
                    expense: 0,
                    balance: 0,
                    transactionCount: 0
                };
            }

            if (transaction.type === 'income') {
                reports[key].income += transaction.amount;
            } else {
                reports[key].expense += transaction.amount;
            }

            reports[key].balance = reports[key].income - reports[key].expense;
            reports[key].transactionCount++;
        });

        return Object.values(reports).sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return new Date(`${a.month} 1, ${a.year}`).getMonth() - new Date(`${b.month} 1, ${b.year}`).getMonth();
        });
    };

    const getYearlyReport = (): YearlyReport[] => {
        const reports: { [key: number]: YearlyReport } = {};

        transactions.forEach(transaction => {
            const year = new Date(transaction.date).getFullYear();

            if (!reports[year]) {
                reports[year] = {
                    year,
                    income: 0,
                    expense: 0,
                    balance: 0,
                    months: []
                };
            }

            if (transaction.type === 'income') {
                reports[year].income += transaction.amount;
            } else {
                reports[year].expense += transaction.amount;
            }

            reports[year].balance = reports[year].income - reports[year].expense;
        });

        return Object.values(reports).sort((a, b) => b.year - a.year);
    };

    const getCurrentPeriodTotals = () => {
        const filtered = filteredTransactions;
        const periodIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const periodExpenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const periodBalance = periodIncome - periodExpenses;

        return { periodIncome, periodExpenses, periodBalance };
    };

    const { periodIncome, periodExpenses, periodBalance } = getCurrentPeriodTotals();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <button
                onClick={() => router.push('/admin-home')}
                className="flex items-center ml-5 mt--8 space-x-2 px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-700 transition"
            >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Home</span>
            </button>

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">
                        Income & Expense Book
                    </h1>
                    <p className="text-slate-600">
                        Track the income and expense of the kalavedhi !
                    </p>
                </div>

                {/* View Mode Toggle */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-slate-600" />
                            <span className="font-medium text-slate-800">View:</span>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => setViewMode('overview')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'overview'
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4 inline mr-2" />
                                Overview
                            </button>

                            <button
                                onClick={() => setViewMode('monthly')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'monthly'
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Monthly
                            </button>

                            <button
                                onClick={() => setViewMode('yearly')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'yearly'
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Yearly
                            </button>
                        </div>
                    </div>

                    {/* Date Filters */}
                    {(viewMode === 'monthly' || viewMode === 'yearly') && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex flex-wrap items-center gap-4">
                                {viewMode === 'yearly' && (
                                    <div className="flex items-center space-x-2">
                                        <label className="text-sm font-medium text-slate-700">Year:</label>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {availableYears.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                            {availableYears.length === 0 && (
                                                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                            )}
                                        </select>
                                    </div>
                                )}

                                {viewMode === 'monthly' && (
                                    <>
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm font-medium text-slate-700">Year:</label>
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {availableYears.map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                                {availableYears.length === 0 && (
                                                    <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                                )}
                                            </select>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm font-medium text-slate-700">Month:</label>
                                            <select
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <option key={i} value={i}>
                                                        {new Date(2023, i).toLocaleString('default', { month: 'long' })}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Balance */}
                    <div className={`p-6 rounded-2xl shadow-lg ${(viewMode === 'overview' ? balance : periodBalance) >= 0
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                        } text-white`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm font-medium">
                                    {viewMode === 'overview' ? 'Total Balance' :
                                        viewMode === 'monthly' ? `${getMonthName(selectedMonth)} ${selectedYear} Balance` :
                                            `${selectedYear} Balance`}
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(viewMode === 'overview' ? balance : periodBalance)}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-emerald-200" />
                        </div>
                    </div>

                    {/* Total Income */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm font-medium">
                                    {viewMode === 'overview' ? 'Total Income' :
                                        viewMode === 'monthly' ? `${getMonthName(selectedMonth)} Income` :
                                            `${selectedYear} Income`}
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(viewMode === 'overview' ? income : periodIncome)}
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    {/* Total Expenses */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm font-medium">
                                    {viewMode === 'overview' ? 'Total Expenses' :
                                        viewMode === 'monthly' ? `${getMonthName(selectedMonth)} Expenses` :
                                            `${selectedYear} Expenses`}
                                </p>
                                <p className="text-2xl font-bold text-red-600">
                                    {formatCurrency(viewMode === 'overview' ? expenses : periodExpenses)}
                                </p>
                            </div>
                            <TrendingDown className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Reports Section - Only show in overview mode */}
                {viewMode === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Monthly Report */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
                            <div className="p-6 border-b border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800">Monthly Report</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4 max-h-64 overflow-y-auto">
                                    {getMonthlyReport().slice(0, 6).map((report, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-800">{report.month} {report.year}</p>
                                                <p className="text-sm text-slate-600">{report.transactionCount} transactions</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-semibold ${report.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(report.balance)}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    ↑{formatCurrency(report.income)} ↓{formatCurrency(report.expense)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Yearly Report */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
                            <div className="p-6 border-b border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-800">Yearly Report</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4 max-h-64 overflow-y-auto">
                                    {getYearlyReport().map((report, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-800">{report.year}</p>
                                                <p className="text-sm text-slate-600">Full Year</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-semibold ${report.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(report.balance)}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    ↑{formatCurrency(report.income)} ↓{formatCurrency(report.expense)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Transaction Form */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4" id="transaction-form">
                        {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                    </h2>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                                    placeholder="Enter description..."
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={amount}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={transactionDate}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTransactionDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setType('income')}
                                className={`p-3 rounded-lg font-medium transition-all ${type === 'income'
                                    ? 'bg-green-500 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <TrendingUp className="w-5 h-5 inline mr-2" />
                                Income
                            </button>

                            <button
                                type="button"
                                onClick={() => setType('expense')}
                                className={`p-3 rounded-lg font-medium transition-all ${type === 'expense'
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <TrendingDown className="w-5 h-5 inline mr-2" />
                                Expense
                            </button>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                ) : editingTransaction ? (
                                    <Edit className="w-5 h-5 mr-2" />
                                ) : (
                                    <Plus className="w-5 h-5 mr-2" />
                                )}
                                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                            </button>
                            {editingTransaction && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Transactions List */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800">
                            {viewMode === 'overview' ? 'Recent Transactions' :
                                viewMode === 'monthly' ? `${getMonthName(selectedMonth)} ${selectedYear} Transactions` :
                                    `${selectedYear} Transactions`}
                            <span className="ml-2 text-sm font-normal text-slate-500">
                                ({filteredTransactions.length} transactions)
                            </span>
                        </h2>
                    </div>

                    <div className="divide-y divide-slate-200">
                        {filteredTransactions.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <IndianRupee  className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                <p>No transactions found for the selected period.</p>
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto">
                                {filteredTransactions.map((transaction: Transaction) => (
                                    <div key={transaction.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`p-2 rounded-full ${transaction.type === 'income'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {transaction.type === 'income' ? (
                                                        <TrendingUp className="w-5 h-5" />
                                                    ) : (
                                                        <TrendingDown className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">
                                                        {transaction.description}
                                                    </p>
                                                    <p className="text-sm text-slate-500 flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        {formatDate(transaction.date)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <span className={`font-semibold ${transaction.type === 'income'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                    }`}>
                                                    {transaction.type === 'income' ? '+' : '-'}
                                                    {formatCurrency(transaction.amount)}
                                                </span>

                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(transaction)}
                                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                                        title="Edit transaction"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(transaction.id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                        title="Delete transaction"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                                {/* Delete Confirmation Modal */}
                                                {showDeleteConfirm && (
                                                   <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

                                                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                                                                <button
                                                                    onClick={cancelDelete}
                                                                    className="text-gray-500 hover:text-gray-700"
                                                                >
                                                                    <X size={20} />
                                                                </button>
                                                            </div>
                                                            <p className="mb-6">Are you sure you want to delete this transaction? This action cannot be undone.</p>
                                                            <div className="flex justify-end space-x-3">
                                                                <button
                                                                    onClick={cancelDelete}
                                                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={deleteTransaction}
                                                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>


    );
};

export default IncomeExpense;