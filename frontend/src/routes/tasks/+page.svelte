<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { token, user } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import { io } from 'socket.io-client';
    import { page } from '$app/stores';

    let tasks = $state<any[]>([]);
    let loading = $state(true);
    let title = $state('');
    let description = $state('');
    let priority = $state('medium');
    let dueDate = $state('');
    let editingId = $state<string | null>(null);
    let editTitle = $state('');
    let editDescription = $state('');
    let editPriority = $state('medium');
    let editStatus = $state('pending');
    let socket: any = null;

    // Pagination
    let pageNum = $state(1);
    let totalPages = $state(1);
    let statusFilter = $state('');
    let priorityFilter = $state('');
    let searchQuery = $state('');

    const limit = 10;

    async function loadTasks() {
        const tok = $token;
        if (!tok) return;

        const params = new URLSearchParams();
        params.set('page', String(pageNum));
        params.set('limit', String(limit));
        if (statusFilter) params.set('status', statusFilter);
        if (priorityFilter) params.set('priority', priorityFilter);
        if (searchQuery) params.set('search', searchQuery);

        const res = await fetch(`/api/tasks?${params}`, {
            headers: { Authorization: `Bearer ${tok}` },
        });
        const data = await res.json();
        if (data.success) {
            tasks = data.tasks;
            totalPages = data.pagination.totalPages;
        }
        loading = false;
    }

    async function createTask() {
        const tok = $token;
        if (!tok || !title.trim()) return;

        await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
            body: JSON.stringify({
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
            }),
        });

        title = '';
        description = '';
        pageNum = 1;
        searchQuery = '';
        statusFilter = '';
        priorityFilter = '';
        await loadTasks();
    }

    async function startEdit(t: any) {
        editingId = t.id;
        editTitle = t.title;
        editDescription = t.description || '';
        editPriority = t.priority;
        editStatus = t.status;
    }

    async function saveEdit() {
        const tok = $token;
        if (!tok || !editingId) return;

        await fetch(`/api/tasks/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
            body: JSON.stringify({
                title: editTitle,
                description: editDescription || undefined,
                priority: editPriority,
                status: editStatus,
            }),
        });

        editingId = null;
        await loadTasks();
    }

    async function deleteTask(id: string) {
        const tok = $token;
        if (!tok) return;

        await fetch(`/api/tasks/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${tok}` },
        });

        await loadTasks();
    }

    function logout() {
        localStorage.removeItem('taskManagerToken');
        localStorage.removeItem('taskManagerUser');
        token.set(null);
        user.set(null);
        if (socket) socket.disconnect();
        goto('/');
    }

    onMount(async () => {
        // Check URL for OAuth callback token
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        if (urlToken) {
            const res = await fetch('/api/auth/social-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: urlToken }),
            });
            const data = await res.json();
            if (data.success) {
                token.set(data.token);
                user.set(data.user);
                localStorage.setItem('taskManagerToken', data.token);
                localStorage.setItem('taskManagerUser', JSON.stringify(data.user));
                window.history.replaceState({}, '', '/tasks');
            }
        }

        const savedToken = localStorage.getItem('taskManagerToken');
        if (!savedToken) {
            goto('/');
            return;
        }
        token.set(savedToken);

        const savedUser = localStorage.getItem('taskManagerUser');
        if (savedUser) {
            user.set(JSON.parse(savedUser));
        }

        await loadTasks();

        socket = io('/', { auth: { token: savedToken } });
        socket.on('taskCreated', () => loadTasks());
        socket.on('taskUpdated', () => loadTasks());
        socket.on('taskDeleted', () => loadTasks());

        onDestroy(() => {
            if (socket) socket.disconnect();
        });
    });
</script>

<div class="layout">
    <header>
        <h1>Task Manager</h1>
        <div class="user-info">
            <span>{$user?.name || 'User'}</span>
            <button onclick={logout}>Logout</button>
        </div>
    </header>

    <main>
        <!-- Create Task Form -->
        <section class="card">
            <h2>New Task</h2>
            <form onsubmit={(e) => { e.preventDefault(); createTask(); }}>
                <input bind:value={title} placeholder="Task title" required />
                <textarea bind:value={description} placeholder="Description (optional)" rows={2}></textarea>
                <div class="row">
                    <select bind:value={priority}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <input bind:value={dueDate} type="datetime-local" />
                </div>
                <button type="submit">Create</button>
            </form>
        </section>

        <!-- Filters -->
        <section class="card">
            <div class="filters">
                <input bind:value={searchQuery} placeholder="Search tasks..." oninput={() => { pageNum = 1; loadTasks(); }} />
                <select bind:value={statusFilter} onchange={() => { pageNum = 1; loadTasks(); }}>
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
                <select bind:value={priorityFilter} onchange={() => { pageNum = 1; loadTasks(); }}>
                    <option value="">All priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
        </section>

        <!-- Task List -->
        <section class="card">
            <h2>Tasks</h2>

            {#if loading}
                <p class="muted">Loading...</p>
            {:else if tasks.length === 0}
                <p class="muted">No tasks yet.</p>
            {:else}
                <div class="task-list">
                    {#each tasks as t (t.id)}
                        <div class="task">
                            {#if editingId === t.id}
                                <input bind:value={editTitle} />
                                <textarea bind:value={editDescription} rows={2}></textarea>
                                <div class="row">
                                    <select bind:value={editPriority}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                    <select bind:value={editStatus}>
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div class="actions">
                                    <button onclick={saveEdit}>Save</button>
                                    <button onclick={() => editingId = null}>Cancel</button>
                                </div>
                            {:else}
                                <div class="task-header">
                                    <strong>{t.title}</strong>
                                    <span class="badge badge-{t.priority}">{t.priority}</span>
                                    <span class="badge badge-{t.status}">{t.status}</span>
                                </div>
                                {#if t.description}
                                    <p class="desc">{t.description}</p>
                                {/if}
                                <div class="actions">
                                    <button onclick={() => startEdit(t)}>Edit</button>
                                    <button class="danger" onclick={() => deleteTask(t.id)}>Delete</button>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>

                <!-- Pagination -->
                <div class="pagination">
                    <button disabled={pageNum <= 1} onclick={() => { pageNum--; loadTasks(); }}>Prev</button>
                    <span>Page {pageNum} of {totalPages}</span>
                    <button disabled={pageNum >= totalPages} onclick={() => { pageNum++; loadTasks(); }}>Next</button>
                </div>
            {/if}
        </section>
    </main>
</div>

<style>
    .layout { min-height: 100vh; background: #f5f5f5; font-family: system-ui, sans-serif; }
    header { background: white; padding: 1rem 2rem; display: flex; justify-content: space-between;
        align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    header h1 { font-size: 1.25rem; font-weight: 700; margin: 0; }
    .user-info { display: flex; align-items: center; gap: 1rem; }
    .user-info button { padding: 0.4rem 0.8rem; background: #dc2626; color: white; border: none;
        border-radius: 0.5rem; cursor: pointer; font-size: 0.8rem; }
    main { max-width: 720px; margin: 2rem auto; padding: 0 1rem; display: flex; flex-direction: column; gap: 1rem; }
    .card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 1px 8px rgba(0,0,0,0.06); }
    .card h2 { margin: 0 0 1rem; font-size: 1.1rem; }
    form { display: flex; flex-direction: column; gap: 0.5rem; }
    input, textarea, select { padding: 0.6rem 0.8rem; border: 1px solid #ddd; border-radius: 0.5rem; font-size: 0.9rem; }
    .row { display: flex; gap: 0.5rem; }
    .row select, .row input { flex: 1; }
    button[type="submit"] { padding: 0.6rem; background: #2563eb; color: white; border: none;
        border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
    .filters { display: flex; gap: 0.5rem; }
    .filters input { flex: 1; }
    .filters select { width: auto; }
    .task-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .task { padding: 1rem; border: 1px solid #eee; border-radius: 0.75rem; }
    .task-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
    .desc { color: #666; font-size: 0.85rem; margin: 0.25rem 0; }
    .actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .actions button { padding: 0.3rem 0.6rem; border: 1px solid #ddd; border-radius: 0.4rem;
        background: white; cursor: pointer; font-size: 0.8rem; }
    .actions .danger { color: #dc2626; border-color: #fca5a5; }
    .badge { font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 1rem; text-transform: capitalize; }
    .badge-high { background: #fef2f2; color: #dc2626; }
    .badge-medium { background: #fffbeb; color: #d97706; }
    .badge-low { background: #f0fdf4; color: #16a34a; }
    .badge-pending { background: #eff6ff; color: #2563eb; }
    .badge-in-progress { background: #fffbeb; color: #d97706; }
    .badge-completed { background: #f0fdf4; color: #16a34a; }
    .muted { color: #999; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem;
        margin-top: 1rem; }
    .pagination button { padding: 0.4rem 0.8rem; border: 1px solid #ddd; border-radius: 0.4rem;
        background: white; cursor: pointer; }
    .pagination button:disabled { opacity: 0.4; cursor: default; }
</style>