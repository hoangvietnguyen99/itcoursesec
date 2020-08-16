import { Component, OnInit } from '@angular/core';
import { LsHelper } from '../helper/ls.helper';
import { User } from '../../model/user';
import { AppService } from '../../services/app.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Course } from 'src/model/course';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  userId: string;
  user: User;
  lsCourses: Course[] = [];
  constructor(
    private appService: AppService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.user = LsHelper.getUserFromStorage();

    this.getUserLogin(this.user._id);
  }
  getUserLogin(userId) {
    this.appService.getUserById(userId).subscribe(
      (res) => {
        this.user = res;
        this.user.purchasedCourseIds.forEach(element => {
          this.getPurchasesCourses(element);
        });
      },
      (err) => {
        console.log(err.error.message);
      }
    );
  }

  getPurchasesCourses(courseId) {
    this.appService.getCourseById(courseId).subscribe(
      (res: any) => {
        this.lsCourses.push(res);
      },
      (err) => this.toastr.warning(err.error.message)
    );
  }
}
