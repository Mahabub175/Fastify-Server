export interface IBlog {
  name: string;
  slug: string;
  shortDescription: string;
  content: string;
  publishedAt: Date;
  attachment: string;
  images: string[];
  isDeleted: boolean;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
