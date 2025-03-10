export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  website?: string;
  isActive: number;
  lastLoginDate?: Date;
  role: {
    id: number;
    name: string;
    description: string | null;
    isActive: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
