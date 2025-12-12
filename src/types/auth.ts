export interface Auth  {
  userEmail: string;
  userPassword: string;
};

export interface UserRegister  {
  userName: string;
  userLastName: string;
  userEmail: string;
  userPassword: string;
};

export type LoginResponse = {
  token: string;
};
