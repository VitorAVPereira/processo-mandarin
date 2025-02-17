"use client"

import { useState } from "react"
import { Calendar, Plus } from "lucide-react"

interface Task {
  id: number
  title: string
  date: string
  completed: boolean
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [selectedDate, setSelectedDate] = useState("")

  const addTask = async () => {
    if (newTask.trim() && selectedDate) {
      const task = {
        id: Date.now(),
        title: newTask,
        date: selectedDate,
        completed: false,
      }

      // Enviar a tarefa para a API
      const response = await fetch('http://localhost:3003/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Adicionar o token JWT
        },
        body: JSON.stringify(task),
      })

      if (response.ok) {
        // Adicionar a tarefa ao array local
        setTasks([...tasks, task])
        setNewTask("")
        setSelectedDate("")
      } else {
        alert('Failed to add task')
      }
    }
  }

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  return (
    <div className="min-h-screen bg-[#434343]">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">My Tasks</h1>

          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter task title"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4003F]"
            />
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4003F] pr-10"
              />
              <Calendar
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={20}
              />
            </div>
            <button
              onClick={addTask}
              className="bg-[#E4003F] text-white px-4 py-2 rounded-md hover:bg-[#E4003F]/90 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add Task
            </button>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="h-5 w-5 rounded border-gray-300 text-[#E4003F] focus:ring-[#E4003F]"
                />
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                    {task.title}
                  </p>
                  <p className="text-sm text-gray-500">{task.date}</p>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-gray-500 py-4">No tasks yet. Add your first task above!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

