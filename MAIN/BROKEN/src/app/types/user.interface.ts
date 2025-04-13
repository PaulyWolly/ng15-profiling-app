import { Role } from '../_models/role';

export interface UserInterface {
  id?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  password?: string;
  token?: string;
  isDeleting?: boolean;
  profileImage?: string; // URL to the stored image
}
