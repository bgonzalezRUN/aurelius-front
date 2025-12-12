import api from "./http";

export const recoveryLink = (userEmail: string) => {
  return api.post("/auth/recoverylink", { userEmail });
};

export const recoveryPassword = (id: string, userPassword: string) => {
  return api.post(`/auth/user/password/${id}`, { userPassword });
};
