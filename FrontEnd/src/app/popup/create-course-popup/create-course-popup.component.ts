import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthenticateService } from '../../../services/authen.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Lesson } from '../../../model/lesson';
import { AppService } from 'src/services/app.service';
import { Course } from 'src/model/course';
declare var $: any;

@Component({
  selector: 'app-create-course-popup',
  templateUrl: './create-course-popup.component.html',
  styleUrls: ['./create-course-popup.component.scss'],
})
export class CreateCoursePopupComponent implements OnInit {
  public event: EventEmitter<any> = new EventEmitter();

  fieldTags: string[] = [];
  tags: string[] = [];

  fieldLessons: Lesson[] = [];
  lessons: Lesson[] = [];

  courseTitle = '';
  coursePrice = 0;
  courseDescription = '';
  btnSubmit: string;
  courseId: string;
  title: string;
  course: Course;

  categories: string[] = [];

  selectCategory: string;
  constructor(
    public bsModalRef: BsModalRef,
    private appService: AppService,
    private authenticateService: AuthenticateService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllCategories();
    if (!this.courseId) {
      this.title = 'Create a Course';
      this.btnSubmit = 'Publish Course';
    } else {
      this.title = 'Edit a Course';
      this.btnSubmit = 'Update Course';

      this.getCourseById(this.courseId);
    }
  }

  addTag() {
    let itemTag = '';
    this.fieldTags.push(itemTag);
  }

  addLessons() {
    const itemLesson = new Lesson();
    this.fieldLessons.push(itemLesson);
  }

  submit() {
    for (let i = 0; i < this.fieldLessons.length; i++) {
      this.lessons[i] = new Lesson();
      this.lessons[i].name = $('#lesson_name_' + i).val();
      this.lessons[i].youtubeCode = $('#lesson_utube_code_' + i).val();
    }
    this.course.lessons = this.lessons;

    for (let i = 0; i < this.fieldTags.length; i++) {
      this.tags[i] = $('#tag_' + i).val();
    }
    this.course.tags = this.tags;
    this.course.name = this.courseTitle;
    this.course.price = this.coursePrice;
    this.course.description = this.courseDescription;

    this.appService.updateCourse(this.course).subscribe(
      (res) => {
        this.toastr.success('Updated Successfully!');
      },
      (err) => {
        this.toastr.warning(err.error.message);
      }
    );
    this.bsModalRef.hide();
  }

  onFileSelected(event) {
    let formData = new FormData();
    formData.append(
      'upload[]',
      event.target.files[0],
      event.target.files[0].name
    );
    this.appService.uploadImage(formData).subscribe(
      (res) => {
        console.log(res);
      },
      (err) => console.log(err)
    );
  }

  getCourseById(courseId: string) {
    this.appService.getCourseById(courseId).subscribe(
      (res: any) => {
        this.course = res;
        this.course.tags.forEach((element) => {
          this.fieldTags.push(element);
        });
        this.course.lessons.forEach((element) => {
          this.fieldLessons.push(element);
        });
        this.courseDescription = this.course.description;
        this.coursePrice = this.course.price;
        this.courseTitle = this.course.name;
        this.selectCategory = this.course.categoryId;
        console.log(this.course);
      },
      (err) => this.toastr.warning(err.error.message)
    );
  }

  getAllCategories() {
    this.appService.getAllCategories().subscribe(
      (res: any) => {
        this.categories = res;
      },
      (err) => {
        this.toastr.warning(err.error.message);
      }
    );
  }

  deletedTag(i) {
    this.fieldTags.splice(i, 1);
  }

  deleteLesson(i) {
    this.fieldLessons.splice(i, 1);
  }
}
