import { Review } from './review';
import { Lesson } from './lesson';
export class Course {
  _id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  imgPath: string;
  description: string;
  uploadDate: Date;
  rating: number;
  reviews: Review[];
  tags: string[];
  purchasedCount: number;
  totalCollect: number;
  view: string;
  price: number;
  lessons: Lesson[];
}
