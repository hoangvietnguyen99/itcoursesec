import { Course } from './course';
import { ItemCart } from './item-cart';
export class Cart {
  _id: string;
  userId: string;
  isCurrent: boolean;
  promotionCode: string;
  isPaid: boolean;
  items: ItemCart[];
  paymentMethod: string;
  paidDate: Date;
  total: number;
  totalAfterPromoted: number;
}
