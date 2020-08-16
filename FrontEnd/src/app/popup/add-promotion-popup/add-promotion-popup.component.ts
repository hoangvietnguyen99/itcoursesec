import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Promotion } from 'src/model/promotion';
import { AppService } from 'src/services/app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-promotion-popup',
  templateUrl: './add-promotion-popup.component.html',
  styleUrls: ['./add-promotion-popup.component.scss'],
})
export class AddPromotionPopupComponent implements OnInit {
  newPromotion: Promotion = new Promotion();
  isSubmit = false;

  public event: EventEmitter<any> = new EventEmitter();

  constructor(
    public bsModalRef: BsModalRef,
    private appService: AppService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  submit() {
    this.isSubmit = true;
    if (
      !this.newPromotion.code ||
      !this.newPromotion.start ||
      !this.newPromotion.end ||
      this.newPromotion.discountPercent == 0 ||
      this.newPromotion.totalAmount == 0
    ) {
      return;
    }
    console.log(this.newPromotion);
    
    this.appService.createPromotionsByAdmin(this.newPromotion).subscribe(
      (res) => {
        this.bsModalRef.hide();
        this.toastr.success('Create Successfully');
        this.triggerEvent(true);
      },
      (err) => {
        this.bsModalRef.hide();
        this.toastr.warning(err.error.message);
      }
    );
  }

  triggerEvent(item: boolean) {
    this.event.emit({ data: item, res: 200 });
  }
}
