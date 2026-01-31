/**
 * Simple fake auth state for development/demo purposes.
 * In production, this should be replaced with real Supabase auth checks.
 */

export const fakeAuth = {
  isLoggedIn: false,
  
  login() {
    this.isLoggedIn = true;
  },
  
  logout() {
    this.isLoggedIn = false;
  }
};