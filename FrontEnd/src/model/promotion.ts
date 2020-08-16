export class Promotion {
  _id: string;
  code: string;
  start: Date;
  end: Date;
  discountPercent: number=0;
  status: string;
  totalAmount: number=0;
  usedCount: number;
  userClass: number;
}