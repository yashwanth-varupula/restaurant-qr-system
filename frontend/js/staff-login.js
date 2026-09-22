/**
 * Staff Login Logic
 * Handles: Auth state on load, form submission, loading states, generic
 * error handling, and redirection to the dashboard on success.
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
    }

    function setLocked(locked) {
        loginBtn.disabled = locked;
        usernameInput.disabled = locked;
        passwordInput.disabled = locked;
    }

    // If a session cookie already exists, skip the login screen entirely
    // rather than sitting on a login form next to a broken state.
    async function checkExistingSession() {
        try {
            if (!window.api || typeof window.api.getMe !== 'function') return;
            const me = await window.api.getMe();
            if (me && me.success) {
                window.location.replace('/staff-dashboard.html');
            }
        } catch (_) {
            // Not authenticated (or offline) - stay on the login form.
        }
    }

    checkExistingSession();

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showError('Please enter both username and password.');
            return;
        }

        hideError();
        setLocked(true);
        loginBtn.textContent = 'Signing in...';

        try {
            const response = await window.api.login({ username, password });

            if (response.success) {
                // Redirect to dashboard on success (replace, so Back skips login)
                window.location.replace('/staff-dashboard.html');
                return;
            }
            throw new Error(response.error || 'Login failed');
        } catch (error) {
            console.error('Login error:', error);

            if (error.isAuthError) {
                // Generic message - never reveal whether the username existed
                showError('Invalid username or password.');
            } else if (error.message && /too many|rate|429/i.test(error.message)) {
                // Rate limit is safe to surface and helps honest users
                showError(error.message);
            } else {
                showError('Unable to sign in right now. Please try again.');
            }

            setLocked(false);
            loginBtn.textContent = 'LOGIN';
        }
    });
});