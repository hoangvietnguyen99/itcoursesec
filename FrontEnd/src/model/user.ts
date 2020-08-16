export class User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  purchasedCourseIds: string[] = [];
  tags: string[];
  exp: number;
  totalSpend: number;
}
