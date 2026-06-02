import React from "react";
import Tasks from "./Tasks";
import "./App.css";

class App extends Tasks {
    state = { tasks: [], currentTask: "", filter: "all" };

    setFilter = (filter) => {
        this.setState({ filter });
    };

    getFilteredTasks() {
        const { tasks, filter } = this.state;
        if (filter === "active") return tasks.filter((t) => !t.completed);
        if (filter === "completed") return tasks.filter((t) => t.completed);
        return tasks;
    }

    render() {
        const { tasks, currentTask, filter } = this.state;
        const filtered = this.getFilteredTasks();
        const completedCount = tasks.filter((t) => t.completed).length;
        const totalCount = tasks.length;
        const activeCount = totalCount - completedCount;
        const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return (
            <div className="app-bg">
                <div className="app-card">

                    {/* ── Header ── */}
                    <div className="app-header">
                        <div className="header-top">
                            <div className="brand">
                                <div className="brand-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                </div>
                                <span className="brand-name">TaskFlow</span>
                            </div>
                            <span className="cloud-badge">☁ Cloud Native</span>
                        </div>

                        {/* Stats */}
                        <div className="stats-row">
                            <div className="stat-box">
                                <span className="stat-num">{totalCount}</span>
                                <span className="stat-lbl">Total</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-num stat-done">{completedCount}</span>
                                <span className="stat-lbl">Done</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-num stat-active">{activeCount}</span>
                                <span className="stat-lbl">Remaining</span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className="progress-label">{progressPct}% complete</span>
                    </div>

                    {/* ── Filter Tabs ── */}
                    <div className="filter-tabs">
                        {["all", "active", "completed"].map((f) => (
                            <button
                                key={f}
                                className={`filter-tab ${filter === f ? "filter-tab--active" : ""}`}
                                onClick={() => this.setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                <span className="filter-count">
                                    {f === "all" ? totalCount : f === "active" ? activeCount : completedCount}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* ── Input ── */}
                    <form className="input-row" onSubmit={this.handleSubmit}>
                        <input
                            className="task-input"
                            value={currentTask}
                            onChange={this.handleChange}
                            placeholder="Add a new task..."
                            required
                        />
                        <button className="add-btn" type="submit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add
                        </button>
                    </form>

                    {/* ── Task List ── */}
                    <div className="task-list">
                        {filtered.length === 0 && (
                            <div className="empty-state">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
                                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                                </svg>
                                <p className="empty-title">
                                    {filter === "completed" ? "No completed tasks yet" :
                                     filter === "active" ? "No active tasks — you're all caught up!" :
                                     "No tasks yet — add one above!"}
                                </p>
                            </div>
                        )}

                        {filtered.map((task) => (
                            <div key={task._id} className={`task-item ${task.completed ? "task-item--done" : ""}`}>
                                {/* Checkbox */}
                                <button
                                    className={`task-check ${task.completed ? "task-check--done" : ""}`}
                                    onClick={() => this.handleUpdate(task._id)}
                                    aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                                >
                                    {task.completed && (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    )}
                                </button>

                                {/* Task text */}
                                <span className={`task-text ${task.completed ? "task-text--done" : ""}`}>
                                    {task.task}
                                </span>

                                {/* Status badge */}
                                <span className={`task-badge ${task.completed ? "task-badge--done" : "task-badge--active"}`}>
                                    {task.completed ? "Done" : "Active"}
                                </span>

                                {/* Delete button */}
                                <button
                                    className="task-delete"
                                    onClick={() => this.handleDelete(task._id)}
                                    aria-label="Delete task"
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* ── Footer ── */}
                    {totalCount > 0 && (
                        <div className="app-footer">
                            {completedCount} of {totalCount} tasks completed
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default App;
