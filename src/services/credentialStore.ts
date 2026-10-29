// ====================================================================
// QUANTUM LEARNING INSTITUTE / TAXCENT CONNECT
// Authoritative Credential & Password Management Store
// Default password for newly added staff and students: "123456"
// ====================================================================

const CREDENTIALS_STORAGE_KEY = 'taxcent_qli_user_credentials_v1';
const ACTIVE_SESSION_KEY = 'taxcent_qli_authenticated_session_v1';

export const DEFAULT_INITIAL_PASSWORD = '123456';

interface CredentialRecord {
  passwordHash: string; // Plain/hashed comparison token
  updatedAt: string;
}

function loadStore(): Record<string, CredentialRecord> {
  try {
    const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStore(data: Record<string, CredentialRecord>): void {
  try {
    localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Could not persist credential update:', err);
  }
}

export const credentialStore = {
  getDefaultPassword(): string {
    return DEFAULT_INITIAL_PASSWORD;
  },

  /**
   * Verifies if the password attempt matches the user's active password.
   * If the user has never changed their password, it checks against DEFAULT_INITIAL_PASSWORD ("123456").
   */
  verifyPassword(email: string, attempt: string): boolean {
    if (!email || !attempt) return false;
    const cleanEmail = email.trim().toLowerCase();
    const cleanAttempt = attempt.trim();

    const store = loadStore();
    const userRec = store[cleanEmail];

    if (!userRec) {
      // Default password is "123456"
      return cleanAttempt === DEFAULT_INITIAL_PASSWORD;
    }

    return userRec.passwordHash === cleanAttempt;
  },

  /**
   * Sets a new password for the user when they update it from their portal.
   */
  setPassword(email: string, newPassword: string): void {
    if (!email || !newPassword) return;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = newPassword.trim();

    const store = loadStore();
    store[cleanEmail] = {
      passwordHash: cleanPass,
      updatedAt: new Date().toISOString(),
    };
    saveStore(store);
  },

  /**
   * Persists an active session user for portal page reloads.
   */
  saveActiveSession(user: unknown): void {
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(user));
    } catch {}
  },

  /**
   * Loads persisted session user.
   */
  getActiveSession<T>(): T | null {
    try {
      const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  /**
   * Clears persisted session.
   */
  clearActiveSession(): void {
    try {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch {}
  },
};
