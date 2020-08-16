import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { LoginPopupComponent } from './popup/login-popup/login-popup.component';
import { RegisterPopupComponent } from './popup/register-popup/register-popup.component';
import { AppService } from '../services/app.service';
import { User } from '../model/user';
import { LsHelper } from './helper/ls.helper';
import { Course } from '../model/course';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'FrontEnd';
  modalRefLogin: BsModalRef;
  modalRefRegister: BsModalRef;
  categories: any;
  user: User;
  isLogin = false;

  courses: Course[] = [];
  course: string;
  selectedCourse: Course;

  constructor(
    private modalService: BsModalService,
    private appService: AppService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private titleService: Title
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.activatedRoute.firstChild;
        while (child) {
          if (child.firstChild) {
            child = child.firstChild;
          } else if (child.snapshot.data && child.snapshot.data['title']) {
            return child.snapshot.data['title'];
          } else {
            return null;
          }
        }
        return null;
      })
    ).subscribe((data: any) => {
      if (data) {
        this.titleService.setTitle(data + ' - ITCOURSESEC');
      }
    });

  }

  ngOnInit() {
    this.checkLogin();
    this.getAllCategories();
    this.getAllCourses();
  }
  openModalLogin() {
    this.modalRefLogin = this.modalService.show(LoginPopupComponent, {
      class: 'gray modal-md',
    });
    this.modalRefLogin.content.event.subscribe((res) => {
      this.isLogin = true;
      this.user = LsHelper.getUserFromStorage();
      window.location.reload();
    });
  }

  openModalRegister() {
    this.modalRefRegister = this.modalService.show(RegisterPopupComponent, {
      class: 'gray modal-md',
    });
    this.modalRefRegister.content.event.subscribe((res) => {
      this.toastr.success('Register successfully!');
      this.openModalLogin();
    });
  }

  getAllCategories() {
    this.appService.getAllCategories().subscribe(
      (res: any) => {
        this.categories = res;
      },
      (err) => console.log(err)
    );
  }

  logoutUser() {
    LsHelper.removeUserStorage();
    this.isLogin = false;
    this.user = null;
    this.router.navigate(['']);
  }

  checkLogin() {
    this.user = LsHelper.getUserFromStorage();
    if (!this.user) {
      this.isLogin = false;
      return;
    }
    const today = new Date();
    const exp = today.getTime() / 1000;
    if (exp > this.user.exp) {
      this.logoutUser();
    }
  }

  getAllCourses() {
    this.appService.getAllCourses().subscribe((res: any) => {
      this.courses = res;
    });
  }

  selectCourse(event: TypeaheadMatch) {
    this.selectedCourse = event.item;
    console.log(this.selectedCourse);
    this.router.navigate(['/course', this.selectedCourse._id]);
  }
}
