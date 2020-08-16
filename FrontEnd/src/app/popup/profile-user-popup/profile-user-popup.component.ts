import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { User } from 'src/model/user';
import { AppService } from 'src/services/app.service';
import { Course } from 'src/model/course';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile-user-popup',
  templateUrl: './profile-user-popup.component.html',
  styleUrls: ['./profile-user-popup.component.scss'],
})
export class ProfileUserPopupComponent implements OnInit {
  userId: string;

  user: User = new User();
  lsCourses: Course[] = [];

  loading = true;
  constructor(
    public bsModalRef: BsModalRef,
    private appService: AppService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (this.userId !== undefined) {
      this.appService.getUserById(this.userId).subscribe(
        (res) => {
          this.user = res;
          this.user.purchasedCourseIds.forEach((element) => {
            this.getPurchasesCourses(element);
          });
        },
        (err) => {}
      );
    }
  }

  getPurchasesCourses(courseId) {
    this.appService.getCourseById(courseId).subscribe(
      (res: any) => {
        this.loading = false;
        this.lsCourses.push(res);
      },
      (err) => this.toastr.warning(err.error.message)
    );
  }
}
