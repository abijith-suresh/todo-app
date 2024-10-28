import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import TaskInput from "./components/TaskInput";
import TaskList from "./components/TaskList";

const App = () => {
  const [tasks, setTasks] = useState([]);

  const addTask = (taskText) => {
    setTasks([...tasks, { text: taskText, completed: false }]);
  };

  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const toggleComplete = (index) => {
    const newTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(newTasks);
  };

  const sortedTasks = tasks.sort((a, b) => {
    return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
  });

  return (
    <div className="container mt-5">
      <h1 className="text-center">Todo App</h1>
      <TaskInput onAddTask={addTask} />
      <TaskList
        tasks={sortedTasks}
        onDelete={deleteTask}
        onToggleComplete={toggleComplete}
      />
    </div>
  );
};

export default App;
