import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import { LsHelper } from '../helper/ls.helper';
import { User } from 'src/model/user';
import { Cart } from 'src/model/cart';
import { AppService } from 'src/services/app.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ItemCart } from 'src/model/item-cart';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

declare var paypal;

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  @ViewChild('paypal', { static: true }) paypalElement: ElementRef;
  hasCart = false;
  user: User;
  usdValue: number;
  paymentMethod: string;

  CartByUser: Cart = new Cart();

  promotionCode: string;

  loading = true;

  modalRef: BsModalRef;
  constructor(
    private appService: AppService,
    private toastr: ToastrService,
    private router: Router,
    private modalService: BsModalService
  ) {}

  paidFor = false;

  ngOnInit(): void {
    this.user = LsHelper.getUserFromStorage();
    this.getCartByUser();
    paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: `Payment for ${this.user.name} cart.`,
                amount: {
                  currencyCode: 'USD',
                  value: this.usdValue,
                },
              },
            ],
          });
        },
        onApprove: async (data, actions) => {
          this.paymentMethod = 'paypal';
          this.loading = true;
          const order = await actions.order.capture();
          this.paidFor = true;
          this.paidCourses(this.paymentMethod);
        },
      })
      .render(this.paypalElement.nativeElement);
  }

  getCartByUser() {
    this.appService.getCartByUser().subscribe(
      (res) => {
        this.loading = false;
        this.CartByUser = res;
        this.convertCurrency(this.CartByUser.totalAfterPromoted);
      },
      (err) => {
        this.toastr.warning(err.error.message);
      }
    );
  }

  convertCurrency(amount: number) {
    this.appService.getCurrencyConverted(amount).subscribe(
      (res) => {
        this.usdValue = res;
      },
      (err) => {
        this.toastr.warning(err.error.message);
      }
    );
  }

  paidCourses(paymentMethod: string) {
    this.appService.paidCourses(paymentMethod).subscribe(
      (res) => {
        this.loading = false;
        this.router.navigate(['profile']);
        this.toastr.success('Checkout successfully!');
      },
      (err) => {
        this.toastr.warning(err.error.message);
      }
    );
  }

  openModal(isDelete: TemplateRef<any>) {
    this.modalRef = this.modalService.show(isDelete, { class: 'modal-sm' });
  }

  deleteCartItem(itemCart: ItemCart) {
    this.loading = true;
    this.modalRef.hide();
    this.appService.deleteItemCart(itemCart.courseId).subscribe(
      (res) => {
        this.getCartByUser();
        this.toastr.success('Deleted Successfully');
      },
      (err) => {
        this.toastr.warning(err.error.message);
      }
    );
  }

  addPromotion() {
    if (!this.promotionCode) {
      return;
    }
    this.loading = true;
    this.appService.addPromotionToCart(this.promotionCode).subscribe(
      (res) => {
        this.getCartByUser();
        this.toastr.success('Submitted Successfully');
      },
      (err) => {
        this.toastr.warning(err.error.message);
        this.getCartByUser();
      }
    );
  }

  refresh(): void {
    window.location.reload();
  }
}
