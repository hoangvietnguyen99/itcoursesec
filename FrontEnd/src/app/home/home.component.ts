import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/services/app.service';
import { Course } from 'src/model/course';
import { User } from 'src/model/user';
import { LsHelper } from '../helper/ls.helper';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  topRateCourses: Course[] = [];
  topFavorites: Course[] = [];
  topFreeCourses: Course[] = [];
  purchasedCourseIds: string[] = [];

  user: User;
  constructor(private appService: AppService) {}

  ngOnInit(): void {
    this.user = LsHelper.getUserFromStorage();
    this.getTopRatedCourses();
    this.getTopFavorites();
    this.getTopFreeCourses();
  }

  getTopRatedCourses() {
    this.appService.getAllCourses().subscribe((res: any) => {
      this.topRateCourses = res;
      this.topRateCourses = this.topRateCourses.sort(
        (leftRate, rightTate): number => {
          if (leftRate.rating > rightTate.rating) return -1;
          if (leftRate.rating < rightTate.rating) return 1;
          return 0;
        }
      );
      this.topRateCourses.splice(4, this.topRateCourses.length - 4);
      if (!this.user) {
        for (let i = 0; i < this.topRateCourses.length; i++) {
          if (this.topRateCourses[i].price > 0) {
            this.topRateCourses[i].view =
              String(this.topRateCourses[i].price) + ' VND';
          } else this.topRateCourses[i].view = 'FREE';
        }
      } else  {
        this.appService.getUserById(this.user._id).subscribe(
          (res) => {
            this.purchasedCourseIds = res.purchasedCourseIds;
            for (let i = 0; i < this.topRateCourses.length; i++) {
              if (
                this.purchasedCourseIds.some(
                  (x) => x === this.topRateCourses[i]._id
                )
              ) {
                this.topRateCourses[i].view = 'LEARN NOW';
              } else if (this.topRateCourses[i].price > 0) {
                this.topRateCourses[i].view =
                  String(this.topRateCourses[i].price) + ' VND';
              } else this.topRateCourses[i].view = 'FREE';
            }
          },
          (err) => {}
        );
      }
    });
  }
  getTopFavorites() {
    this.appService.getAllCourses().subscribe((res: any) => {
      this.topFavorites = res;
      this.topFavorites = this.topFavorites.sort(
        (leftFavorite, rightFavorite): number => {
          if (leftFavorite.purchasedCount > rightFavorite.purchasedCount)
            return -1;
          if (leftFavorite.purchasedCount < rightFavorite.purchasedCount)
            return 1;
          return 0;
        }
      );

      this.topFavorites.splice(4, this.topFavorites.length - 4);
      if (!this.user) {
        for (let i = 0; i < this.topFavorites.length; i++) {
          if (this.topFavorites[i].price > 0) {
            this.topFavorites[i].view =
              String(this.topFavorites[i].price) + ' VND';
          } else this.topFavorites[i].view = 'FREE';
        }
      } else  {
        this.appService.getUserById(this.user._id).subscribe(
          (res) => {
            this.purchasedCourseIds = res.purchasedCourseIds;
            for (let i = 0; i < this.topFavorites.length; i++) {
              if (
                this.purchasedCourseIds.some(
                  (x) => x === this.topFavorites[i]._id
                )
              ) {
                this.topFavorites[i].view = 'LEARN NOW';
              } else if (this.topFavorites[i].price > 0) {
                this.topFavorites[i].view =
                  String(this.topFavorites[i].price) + ' VND';
              } else this.topFavorites[i].view = 'FREE';
            }
          },
          (err) => {}
        );
      }
    });
  }

  getTopFreeCourses() {
    this.appService.getAllCourses().subscribe((res: any) => {
      this.topFreeCourses = res;
      this.topFreeCourses = this.topFreeCourses.filter((item) => {
        return item.price == 0;
      });

      this.topFreeCourses = this.topFreeCourses.sort(
        (leftFree, rightFree): number => {
          if (leftFree.rating > rightFree.rating) return -1;
          if (leftFree.rating < rightFree.rating) return 1;
          return 0;
        }
      );

      this.topFreeCourses.splice(4, this.topFreeCourses.length - 4);
      if (!this.user) {
        for (let i = 0; i < this.topFreeCourses.length; i++) {
          this.topFreeCourses[i].view = 'FREE';
        }
      } else  {
        this.appService.getUserById(this.user._id).subscribe(
          (res) => {
            this.purchasedCourseIds = res.purchasedCourseIds;
            for (let i = 0; i < this.topFreeCourses.length; i++) {
              if (
                this.purchasedCourseIds.some(
                  (x) => x === this.topFreeCourses[i]._id
                )
              ) {
                this.topFreeCourses[i].view = 'LEARN NOW';
              } else this.topFreeCourses[i].view = 'FREE';
            }
          },
          (err) => {}
        );
      }
    });
  }
}
