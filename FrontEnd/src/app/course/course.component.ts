import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app.service';
import { Course } from '../../model/course';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../model/user';
import { LsHelper } from '../helper/ls.helper';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LoginPopupComponent } from '../popup/login-popup/login-popup.component';
import { PersonalCourses } from 'src/model/personal-courses';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss'],
})
export class CourseComponent implements OnInit {
  course: any;
  courseId: string;

  modalRefLogin: BsModalRef;

  user: User;

  maxRating = 5;
  rate: number;
  isReadonlyView = true;
  isReadonly = false;
  hoverRate = 0;

  srcYoutube: SafeResourceUrl;

  comment: string;

  personalCourses: PersonalCourses[] = [];

  similarCourses: PersonalCourses[] = [];
  recommendCourses: PersonalCourses[] = [];

  constructor(
    private appService: AppService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.user = LsHelper.getUserFromStorage();
    this.activatedRoute.params.subscribe((param) => {
      this.courseId = param.id;
      if (this.user) {
        this.appService.getUserById(this.user._id).subscribe(
          (res) => {
            this.user = res;
            this.getCourseById(this.courseId);
          },
          (err) => {}
        );
      } else {
        this.getCourseByIdNoneUser(this.courseId);
      }
    });
  }
  getCourseById(courseId: string) {
    this.appService.getCourseById(courseId).subscribe(
      (res: any) => {
        this.course = res;
        this.sortCourses(this.user,true);

        this.checkReview();
        if (this.course.lessons) {
          this.updateVideoUrl(this.course.lessons[0].youtubeCode);
        }
      },
      (err) => this.toastr.warning(err.error.message)
    );
  }

  getCourseByIdNoneUser(courseId: string) {
    this.appService.getCourseByIdNoneUser(courseId).subscribe(
      (res: any) => {
        this.course = res;
        this.checkReview();
        this.sortCourses(this.user,false);

      },
      (err) => this.toastr.warning(err.error.message)
    );
  }

  hoveringOver(value: number): void {
    this.hoverRate = value;
  }

  checkReview() {
    if (!this.user) {
      this.isReadonly = true;
      return;
    }
    this.course.reviews.forEach((element) => {
      if (element.userId === this.user._id) {
        this.rate = element.rating;
        this.hoverRate = element.rating;
        return;
      }
      this.isReadonly = false;
    });
  }

  addReview() {
    if (
      !this.rate ||
      this.rate <= 0 ||
      this.comment == null ||
      this.comment === ''
    ) {
      return;
    }
    const review = {
      comment: this.comment,
      rating: this.rate,
    };
    this.appService.addReview(review, this.courseId).subscribe(
      (res: any) => {
        this.toastr.success('Reviewed');
        this.getCourseById(this.courseId);
      },
      (err) => {
        this.toastr.warning(err.error.message);
      }
    );
  }

  addCourseToCart(courseId: string) {
    if (!this.user) {
      const initialState = {
        routing: 'course/' + this.courseId,
      };
      this.modalRefLogin = this.modalService.show(LoginPopupComponent, {
        class: 'gray modal-md',
        initialState,
      });
      this.modalRefLogin.content.event.subscribe((res) => {
        this.refresh();
      });
    } else {
      this.appService.addCourseToCart(courseId).subscribe(
        (res: any) => {
          this.toastr.success('Add Course successfully');
        },
        (err) => {
          this.toastr.warning(err.error.message);
        }
      );
    }
  }

  updateVideoUrl(srcYoutube) {
    const path = 'https://www.youtube.com/embed/';
    const dangerousVideoUrl = path + srcYoutube;
    this.srcYoutube = this.sanitizer.bypassSecurityTrustResourceUrl(
      dangerousVideoUrl
    );
  }

  refresh(): void {
    window.location.reload();
  }

  sortCourses(user: User, isLogin: boolean) {
    this.appService.getAllCourses().subscribe((res: any) => {
      let i = 0;
      res.forEach((element) => {
        this.personalCourses[i] = new PersonalCourses();
        this.personalCourses[i].course = element;
        i++;
      });
      
      this.personalCourses = this.personalCourses.filter(
        (item) => item.course._id != this.course._id
      );
        if(isLogin){
      user.purchasedCourseIds.forEach((courseId) => {
        this.personalCourses = this.personalCourses.filter(
          (item) => item.course._id != courseId
        );
      });}
      

      this.personalCourses.forEach((course) => {
        if(isLogin){
        user.tags.forEach((tag) => {
          if (course.course.tags.includes(tag)) {
            course.countRecommend++;
            return;
          }
        });}
        this.course.tags.forEach((tag) => {
          if (course.course.tags.includes(tag)) {
            course.countSimilar++;
            return;
          }
        });
      });
      if(isLogin){

      
      this.recommendCourses = [
        ...this.personalCourses
          .sort((a, b) => b.countRecommend - a.countRecommend)
          .slice(0, 5),
      ];}else{
        this.recommendCourses = null;
      }

      this.similarCourses = [
        ...this.personalCourses
          .sort((a, b) => b.countSimilar - a.countSimilar)
          .slice(0, 5),
      ];
    });
  } 

  learnFreeCourse(courseId) {
    if (!this.user) {
      const initialState = {
        routing: 'course/' + this.courseId,
      };
      this.modalRefLogin = this.modalService.show(LoginPopupComponent, {
        class: 'gray modal-md',
        initialState,
      });
      this.modalRefLogin.content.event.subscribe((res) => {
        this.refresh();
      });
    }else {
    this.appService.learnFreeCourse(courseId).subscribe(
      (res) => {
        this.getCourseById(courseId);
        this.toastr.success('Successfully');
      },
      (err) => {
        this.toastr.warning(err.error.message);
      }
    );
  }
}
}
