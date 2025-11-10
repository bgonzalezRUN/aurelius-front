import api from "./http";

export const login = (userEmail: string, userPassword: string) => {
  return api.post("/auth/login", { userEmail, userPassword });
};

export const register = (
  userName: string,
  userLastName: string,
  userEmail: string,
  userPassword: string
) => {
  return api.post("/user", {
    userName,
    userLastName,
    userEmail,
    userPassword,
  });
};

export const recoveryLink = (userEmail: string) => {
  return api.post("/auth/recoverylink", { userEmail });
};

export const recoveryPassword = (id: string, userPassword: string) => {
  return api.post(`/auth/user/password/${id}`, { userPassword });
};
