<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabase';
    import { token, user } from '$lib/stores/auth';
    import { goto } from '$app/navigation';

    onMount(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
        // Extract the name from Google/GitHub provider metadata safely
        const providerName = session.user.user_metadata?.full_name || 
                             session.user.user_metadata?.name || 
                             'Social User';

        // Shape the object to match what your auth store expects
            const localUserPayload = {
                id: session.user.id,
                email: session.user.email ?? '',
                name: providerName
            };

                // 1. Update your local auth stores
                token.set(session.access_token);
                user.set(localUserPayload); // No more TypeScript error!

                // 2. Persist local storage keys
                localStorage.setItem('taskManagerToken', session.access_token);
                localStorage.setItem('taskManagerUser', JSON.stringify(localUserPayload));

                // 3. Clean up the address bar cleanly (removes ?code=...)
                if (window.location.search.includes('code=')) {
                    window.history.replaceState({}, '', window.location.pathname);
                }

            // 4. Safely route the user to their tasks
            await goto('/tasks');
        }
    });

        // Component cleanup logic
        return () => {
            subscription.unsubscribe();
        };
    });

    let mode = $state<'login' | 'register'>('login');
    let email = $state('');
    let password = $state('');
    let name = $state('');
    let status = $state('');
    let loading = $state(false);

    async function handleSubmit() {
        status = '';
        loading = true;

        try {
            const body = mode === 'register'
                ? { name, email, password }
                : { email, password };

            const res = await fetch(`/api/auth/${mode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!data.success) {
                status = data.message;
                return;
            }

            if (mode === 'register') {
                mode = 'login';
                status = 'Account created! Please log in.';
                return;
            }

            token.set(data.token);
            user.set(data.user);
            localStorage.setItem('taskManagerToken', data.token);
            localStorage.setItem('taskManagerUser', JSON.stringify(data.user));
            goto('/tasks');
        } catch {
            status = 'Something went wrong';
        } finally {
            loading = false;
        }
    }

    async function socialLogin(provider: 'google' | 'github') {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { 
                // Redirect back to the exact login route; PKCE handles the code locally
                redirectTo: window.location.origin + window.location.pathname,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'select_account',
                }
            },
        });

        if (error) {
            status = error.message;
            return;
        }

        if (data?.url) {
            window.location.href = data.url;
        }
    }
</script>

<div class="page">
    <div class="card">
        <h1>Task Manager</h1>

        <div class="tabs">
            <button class="tab" class:active={mode === 'login'} onclick={() => mode = 'login'}>
                Login
            </button>
            <button class="tab" class:active={mode === 'register'} onclick={() => mode = 'register'}>
                Sign Up
            </button>
        </div>

        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {#if mode === 'register'}
                <input bind:value={name} placeholder="Full Name" required />
            {/if}
            <input bind:value={email} type="email" placeholder="Email" required />
            <input bind:value={password} type="password" placeholder="Password" required minlength={6} />
            <button type="submit" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
        </form>

        {#if status}
            <p class="status">{status}</p>
        {/if}

        <div class="divider"><span>or</span></div>

        <div class="social">
            <button onclick={() => socialLogin('google')} class="btn-google">Continue with Google</button>
            <button onclick={() => socialLogin('github')} class="btn-github">Continue with GitHub</button>
        </div>
    </div>
</div>

<style>
    .page { min-height: 100vh; display: flex; align-items: center; justify-content: center;
        background: #f5f5f5; font-family: system-ui, sans-serif; }
    .card { background: white; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        width: 100%; max-width: 420px; }
    h1 { text-align: center; font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem; }
    .tabs { display: flex; border-bottom: 2px solid #eee; margin-bottom: 1.5rem; }
    .tab { flex: 1; padding: 0.75rem; border: none; background: none; font-size: 1rem;
        font-weight: 600; color: #999; cursor: pointer; }
    .tab.active { color: #2563eb; border-bottom: 2px solid #2563eb; margin-bottom: -2px; }
    form { display: flex; flex-direction: column; gap: 0.75rem; }
    input { padding: 0.75rem 1rem; border: 1px solid #ddd; border-radius: 0.75rem; font-size: 1rem; }
    button[type="submit"] { padding: 0.75rem; background: #2563eb; color: white; border: none;
        border-radius: 0.75rem; font-size: 1rem; font-weight: 600; cursor: pointer; }
    button[type="submit"]:disabled { opacity: 0.6; }
    .status { text-align: center; margin-top: 0.75rem; font-size: 0.875rem; color: #dc2626; }
    .divider { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; color: #999; font-size: 0.875rem; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #eee; }
    .social { display: flex; flex-direction: column; gap: 0.75rem; }
    .social button { padding: 0.75rem; border: 1px solid #ddd; border-radius: 0.75rem;
        font-size: 0.9rem; font-weight: 500; cursor: pointer; background: white; }
</style>