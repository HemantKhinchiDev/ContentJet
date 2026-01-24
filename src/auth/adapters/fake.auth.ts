import { AuthContextValue, AuthUser } from "../auth.types";

let fakeUser: AuthUser | null = {
  id: "fake-user-1",
  email: "demo@contentjet.dev",
  name: "Demo User",
};

export function createFakeAuth(): AuthContextValue {
  return {
    status: fakeUser ? "auth" : "guest",
    user: fakeUser,

    async signIn() {
      fakeUser = {
        id: "fake-user-1",
        email: "demo@contentjet.dev",
        name: "Demo User",
      };
    },

    async signOut() {
      fakeUser = null;
    },
  };
}
