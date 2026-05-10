"use client";
import React, { useState } from "react";

const Page = () => {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (task.trim() === "") return;

    setTasks([...tasks, task]); 
    setTask("");
  };
const deletebtn=(index)=>{
let updatedtasks=tasks.filter((_,i)=>i!==index);
setTasks(updatedtasks)
    
}
  return (
    <div className="justify-center flex align-middle">
      <div className="main-todo">
        <div>
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            type="text"
            placeholder="Enter the task"
            className="task-inp"
            onKeyDown={((e)=>{
                if (e.key=="Enter"){
                    addTask();
                }
            })}
          />

          <button
            onClick={addTask}
            className="border-2 px-4 py-2"
            
          >
            Add task
          </button>
        </div>

        <div className="task-list">
          <div>
            {tasks.map((t, index) => (
              <h3 className="flex justify-between gap-3 pt-3" key={index}>{t} <button onClick={()=>deletebtn(index)} className="bg-red-600 px-2 py-1">Delete</button></h3>
               
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
