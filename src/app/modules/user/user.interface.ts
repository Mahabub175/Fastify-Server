export interface IUser {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
  attachment: string;
  images: string[];
  isDeleted: boolean;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
