import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app.service';
import { ActivatedRoute } from '@angular/router';
import { Course } from '../../model/course';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/model/user';
import { LsHelper } from '../helper/ls.helper';
import { element } from 'protractor';

enum SortType {
  Rating = 0,
  Favorite = 1,
  Free = 2,
}

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  categoryId: string;
  categoryName: string;

  categories: any;
  searchCategory: string;
  selectCategory = 'All';
  all = 'All';

  inputString = '';
  searchString: string;
  user: User;
  config: any;
  purchasedCourseIds: string[] = [];

  totalCount: number;
  sortType: number;

  loading = true;
  constructor(
    private appService: AppService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.user = LsHelper.getUserFromStorage();

    this.activatedRoute.params.subscribe((param) => {
      this.categoryId = param.categoryId;
    });

    this.activatedRoute.params.subscribe((param) => {
      this.sortType = param.sortType;
    });
    this.getAllCategories();
    if (this.categoryId != null) {
      this.getAllCoursesByCategoryId(this.categoryId);
      this.getCategoryById(this.categoryId);
    } else if (this.sortType) {
      this.getAllCourses(this.sortType);
    } else {
      this.getAllCourses(SortType.Rating);
    }
    this.config = {
      itemsPerPage: 9,
      currentPage: 1,
      totalItems: this.totalCount,
    };
  }

  getAllCourses(sortType) {
    this.loading = true;
    this.appService.getAllCourses().subscribe((res: any) => {
      this.courses = res;
      this.ViewCourses();
      if (sortType == -1) {
        return;
      }
      if (sortType == SortType.Rating) {
        this.courses = this.courses.sort((leftRate, rightTate): number => {
          if (leftRate.rating > rightTate.rating) {
            return -1;
          }
          if (leftRate.rating < rightTate.rating) {
            return 1;
          }
          return 0;
        });
      } else if (sortType == SortType.Favorite) {
        this.courses = this.courses.sort(
          (leftFavorite, rightFavorite): number => {
            if (leftFavorite.purchasedCount > rightFavorite.purchasedCount) {
              return -1;
            }
            if (leftFavorite.purchasedCount < rightFavorite.purchasedCount) {
              return 1;
            }
            return 0;
          }
        );
      } else if (sortType == SortType.Free) {
        this.courses = this.courses.filter((item) => {
          return item.price == 0;
        });
        this.courses = this.courses.sort(
          (leftRate: Course, rightTate: Course): number => {
            if (leftRate.rating > rightTate.rating) {
              return -1;
            }
            if (leftRate.rating < rightTate.rating) {
              return 1;
            }
            return 0;
          }
        );
      }
    });
  }

  getAllCoursesByCategoryId(categoryId: string) {
    this.loading = true;
    this.appService.getCoursesByCategoryId(categoryId).subscribe((res: any) => {
      this.courses = res;
      this.totalCount = this.courses.length;
      this.ViewCourses();
    });
  }

  getCategoryById(categoryId: string) {
    this.appService.getCategoryById(categoryId).subscribe(
      (res) => {
        this.categoryName = res.name;
      },
      (err) => {
        this.toastr.warning(err.error.message);
        this.loading = false;
      }
    );
  }

  getAllCategories() {
    this.appService.getAllCategories().subscribe(
      (res: any) => {
        this.categories = res;
      },
      (err) => {
        this.toastr.warning(err.error.message);
        this.loading = false;
      }
    );
  }

  searchCourses() {
    this.loading = true;
    this.courses = [];
    this.searchString = this.inputString;
    this.searchCategory = this.selectCategory;
    if (this.searchCategory === 'All') {
      this.appService.getAllCourses().subscribe(
        (res: Course[]) => {
          if (this.searchString === '') {
            this.courses = res;
            this.ViewCourses();
            return;
          }
          res.forEach((element) => {
            if (element.name.includes(this.searchString)) {
              this.courses.push(element);
            } else {
              element.tags.forEach((tag) => {
                if (this.searchString.toLowerCase() === tag.toLowerCase()) {
                  this.courses.push(element);
                }
              });
            }
          });
          this.ViewCourses();
        },
        (err) => {
          this.toastr.warning(err.error.message);
          this.loading = false;
        }
      );
    } else {
      this.appService.getCoursesByCategoryId(this.searchCategory).subscribe(
        (res: Course[]) => {
          if (this.searchString === '') {
            this.courses = res;
            this.ViewCourses();
            return;
          }
          res.forEach((element) => {
            if (element.name.includes(this.searchString)) {
              this.courses.push(element);
            } else {
              element.tags.forEach((tag) => {
                if (this.searchString.toLowerCase() === tag.toLowerCase()) {
                  this.courses.push(element);
                }
              });
            }
          });
          this.ViewCourses();
        },
        (err) => {
          this.toastr.warning(err.error.message);
          this.loading = false;
        }
      );
    }
  }

  ViewCourses() {
    this.loading = false;
    this.totalCount = this.courses.length;
    if (!this.user) {
      for (let i = 0; i < this.courses.length; i++) {
        if (this.courses[i].price > 0) {
          this.courses[i].view = String(this.courses[i].price) + ' VND';
        } else {
          this.courses[i].view = 'FREE';
        }
      }
    } else {
      this.appService.getUserById(this.user._id).subscribe(
        (res) => {
          this.purchasedCourseIds = res.purchasedCourseIds;
          for (let i = 0; i < this.courses.length; i++) {
            if (
              this.purchasedCourseIds.some((x) => x === this.courses[i]._id)
            ) {
              this.courses[i].view = 'LEARN NOW';
            } else if (this.courses[i].price > 0) {
              this.courses[i].view = String(this.courses[i].price) + ' VND';
            } else {
              this.courses[i].view = 'FREE';
            }
          }
        },
        (err) => {}
      );
    }
  }

  pageChanged(numpage) {
    this.config.currentPage = numpage;
  }
}
