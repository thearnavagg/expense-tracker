import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [filter, setFilter] = useState("");
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const apiUrl = import.meta.env.VITE_GROQ_API_URL;
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  const addExpense = (e) => {
    e.preventDefault();
    const newExpense = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      date,
    };
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    setDescription("");
    setAmount("");
    setDate("");
    summarizeExpenses(updatedExpenses);
  };

  const deleteExpense = (id) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(updatedExpenses);
    summarizeExpenses(updatedExpenses);
  };

  const filteredExpenses = expenses.filter((expense) =>
    expense.description.toLowerCase().includes(filter.toLowerCase())
  );

  const summarizeExpenses = async (expensesList) => {
    setLoadingSummary(true);
    const expensesText = expensesList
      .map(
        (exp) =>
          `Description: ${exp.description}, Amount: ₹${exp.amount.toFixed(
            2
          )} on ${exp.date}`
      )
      .join(". ");

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ text: expensesText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error summarizing expenses:", error);
      setSummary("Failed to summarize expenses");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Expense Tracker
      </h1>

      <form
        onSubmit={addExpense}
        className="mb-6 p-6 bg-gray-50 shadow-md rounded-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Expense description"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex justify-center items-center transition duration-300 ease-in-out"
        >
          <Plus className="mr-2" size={20} />
          Add Expense
        </button>
      </form>

      <div className="mb-6">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search expenses by description"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <ul className="space-y-4">
        {filteredExpenses.map((expense) => (
          <li
            key={expense.id}
            className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 ease-in-out"
          >
            <div>
              <p className="font-semibold text-gray-800">
                {expense.description}
              </p>
              <p className="text-sm text-gray-500">{expense.date}</p>
            </div>
            <div className="flex items-center">
              <span className="font-bold text-lg text-gray-700 mr-4">
                ₹{expense.amount.toFixed(2)}
              </span>
              <button
                onClick={() => deleteExpense(expense.id)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 ease-in-out"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {loadingSummary ? (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow-md">
          <p className="text-center text-gray-600">Summarizing expenses...</p>
        </div>
      ) : (
        summary && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-blue-700 mb-2">
              Expense Summary
            </h2>
            <p className="text-gray-700">{summary}</p>
          </div>
        )
      )}
    </div>
  );
}
