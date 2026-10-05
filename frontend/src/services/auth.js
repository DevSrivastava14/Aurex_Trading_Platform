export const AUTH_TOKEN_KEY = "aurexToken";
export const AUTH_USER_KEY = "aurexUser";
export const AUTH_STATE_CHANGE_EVENT = "aurex-auth-state-change";

function notifyAuthStateChanged() {
    window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
}

export function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser() {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch {
        localStorage.removeItem(AUTH_USER_KEY);
        return null;
    }
}

export function saveAuthSession(token, user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    notifyAuthStateChanged();
}

export function clearAuthSession() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    notifyAuthStateChanged();
}
