import { useEffect, useState } from 'react';
import { api } from '../api/taskApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Tasks() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiMessage, setAiMessage] = useState('');

  const load = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      setTasks(await api.getTasks(token));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  if (!token) {
    return <div className="card"><h2>Tasks</h2><p>Please login first.</p><Link to="/login">Login</Link></div>;
  }

  const create = async event => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      await api.createTask({ title, description }, token);
      setTitle('');
      setDescription('');
      setAiMessage('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const generateDescription = async () => {
    if (!title.trim()) {
      setAiMessage('Enter a task title first.');
      return;
    }
    try {
      setAiLoading(true);
      setAiMessage('');
      const result = await api.generateDescription(title, token);
      setDescription(result.description);
      setAiMessage('AI description generated. You can edit it before saving.');
    } catch (err) {
      setAiMessage(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const update = async task => {
    try {
      await api.updateTask(task._id, {
        title: task.title,
        description: task.description,
        completed: !task.completed
      }, token);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async id => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(id, token);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <div className="card">
        <h2>Task Manager</h2>
        <form onSubmit={create}>
          <input required placeholder="Task title" value={title} onChange={event => setTitle(event.target.value)} />
          <textarea placeholder="Description" value={description} onChange={event => setDescription(event.target.value)} />
          <button type="button" onClick={generateDescription} disabled={aiLoading}>
            {aiLoading ? 'Generating...' : '✨ Generate description with AI'}
          </button>
          {aiMessage && <p className="ai-message" role="status">{aiMessage}</p>}
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Task'}</button>
        </form>
        {loading && <p>Loading tasks...</p>}
        {error && <p className="error" role="alert">{error}</p>}
      </div>

      <div className="grid">
        {tasks.map(task => (
          <article className="card" key={task._id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.completed ? 'Completed' : 'Pending'}</p>
            <button onClick={() => update(task)}>{task.completed ? 'Mark Pending' : 'Mark Completed'}</button>
            <button onClick={() => remove(task._id)}>Delete</button>
          </article>
        ))}
        {!loading && tasks.length === 0 && <p>No tasks yet. Create your first task above.</p>}
      </div>
    </section>
  );
}
