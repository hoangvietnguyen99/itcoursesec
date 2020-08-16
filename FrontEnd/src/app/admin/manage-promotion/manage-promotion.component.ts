import { Component, OnInit, TemplateRef } from '@angular/core';
import { Promotion } from 'src/model/promotion';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppService } from 'src/services/app.service';
import { ToastrService } from 'ngx-toastr';
import { AddPromotionPopupComponent } from 'src/app/popup/add-promotion-popup/add-promotion-popup.component';
declare var $: any;

@Component({
  selector: 'app-manage-promotion',
  templateUrl: './manage-promotion.component.html',
  styleUrls: ['./manage-promotion.component.scss'],
})
export class ManagePromotionComponent implements OnInit {
  allPromotions: Promotion[] = [];
  modelRefCreatePromotion: BsModalRef;

  loading = true;

  modalRef: BsModalRef;

  constructor(
    private appService: AppService,
    private toastr: ToastrService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.getAllPromotions();
  }
  getAllPromotions() {
    this.appService.getAllPromotionsByAdmin().subscribe(
      (res: any) => {
        this.loading = false;
        this.allPromotions = res;
      },
      (err) => {
        this.toastr.warning(err.error.message);
      }
    );
  }

  showCreatePromotionPopup() {
    this.modelRefCreatePromotion = this.modalService.show(
      AddPromotionPopupComponent,
      {
        class: 'gray modal-lg',
      }
    );
    this.modelRefCreatePromotion.content.event.subscribe((res) => {
      this.loading = true;
      this.getAllPromotions();
    });
  }

  openModal(isDelete: TemplateRef<any>) {
    this.modalRef = this.modalService.show(isDelete, { class: 'modal-sm' });
  }

  deletePromotion(code) {
    this.modalRef.hide();
    this.appService.deletePromotionsByAdmin(code).subscribe(
      (res: any) => {
        this.toastr.success('Deleted successfully');
        this.loading = true;
        this.getAllPromotions();
      },
      (err) => {
        this.toastr.warning(err.error.message);
      }
    );
  }

  editPromotion(promotionId) {
    //   const initialState = {
    //     courseId
    //   };
    //   this.modalRefCreateCourse = this.modalService.show(
    //     CreateCoursePopupComponent,
    //     {
    //       class: 'gray modal-lg', initialState
    //     }
    //   );
  }

  onChange(code,status,i, previousStatus) {
    this.appService.updateStatusPromotion(code,status).subscribe(
      (res: any) => {
        this.toastr.success('Updated successfully');
      },
      (err) => {
        this.toastr.warning(err.error.message);
        $('#status_'+i).val(previousStatus);
      }
    );
  }
}
