import api from "./http";

export const login = (email: string, password: string) => {
    return api.post("/auth/login", { email, password });
};

export const register = (name: string, lastName: string, email: string, password: string, role: string) => {
    return api.post("/auth/user", { name, lastName, email, password, role });
};

export const recoveryLink = (email: string) => {
    return api.post("/auth/recoverylink", { email });
};

export const recoveryPassword = (id: string, password: string) => {
    return api.post(`/auth/user/password/${id}`, { password });
};

