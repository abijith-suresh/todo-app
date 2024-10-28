import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const TaskList = ({ tasks, onDelete, onToggleComplete }) => {
  return (
    <ul className="list-group">
      {tasks.map((task, index) => (
        <li
          key={index}
          className={`list-group-item d-flex justify-content-between align-items-center ${
            task.completed ? "list-group-item-success" : ""
          }`}
        >
          <span>{task.text}</span>
          <div>
            <button
              className="btn btn-success btn-sm"
              onClick={() => onToggleComplete(index)}
            >
              <i
                className={`bi ${
                  task.completed ? "bi-arrow-counterclockwise" : "bi-check2"
                }`}
              ></i>
            </button>
            <button
              className="btn btn-danger btn-sm ms-2"
              onClick={() => onDelete(index)}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
