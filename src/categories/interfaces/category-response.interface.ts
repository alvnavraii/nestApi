export interface CategoryResponse {
  id: number;
  name: string;
  categoryCode: string;
  description: string | null;
  imageUrl: string | null;
  isActive: number;
  displayOrder: number | null;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number | null;
  updatedBy: number | null;
}
