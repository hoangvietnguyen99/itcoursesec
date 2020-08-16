import { Component, OnInit, TemplateRef } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { Course } from '../../../model/course';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CreateCoursePopupComponent } from '../../popup/create-course-popup/create-course-popup.component';

@Component({
  selector: 'app-manage-courses',
  templateUrl: './manage-courses.component.html',
  styleUrls: ['./manage-courses.component.scss'],
})
export class ManageCoursesComponent implements OnInit {
  allCourses: Course[] = [];
  modalRefCreateCourse: BsModalRef;

  loading = true;

  modalRef: BsModalRef;

  constructor(
    private appService: AppService,
    private toastr: ToastrService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.getAllCourses();
  }
  getAllCourses() {
    this.appService.getAllCoursesByAdmin().subscribe(
      (res: any) => {
        this.loading = false;
        this.allCourses = res;
      },
      (err) => {
        this.toastr.warning(err.error.message);
      }
    );
  }

  showCreateCoursePopup() {
    this.modalRefCreateCourse = this.modalService.show(
      CreateCoursePopupComponent,
      {
        class: 'gray modal-lg',
      }
    );
    // this.modalRefRegister.content.event.subscribe((res) => {
    //   this.toastr.success('Register successfully!');
    //   this.openModalLogin();
    // });
  }
  openModal(isDelete: TemplateRef<any>) {
    this.modalRef = this.modalService.show(isDelete, { class: 'modal-sm' });
  }

  deleteCourse(courseId) {
    this.loading = true;
    this.modalRef.hide();
    this.appService.deleteCourseByAdmin(courseId).subscribe(
      (res) => {
        this.toastr.success('Delete successfully!');
        this.getAllCourses();
      },
      (err) => {
        this.toastr.warning(err.error.message);
      }
    );
  }

  editCourse(courseId){
    const initialState = {
      courseId
    };
    this.modalRefCreateCourse = this.modalService.show(
      CreateCoursePopupComponent,
      {
        class: 'gray modal-lg', initialState
      }
    );
  }
}
