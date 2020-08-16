import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LsHelper } from '../app/helper/ls.helper';
import { Course } from 'src/model/course';
import { Promotion } from 'src/model/promotion';
@Injectable({
  providedIn: 'root',
})
export class AppService {
  apiUrl = 'api/';
  httpOptions: any;
  constructor(private http: HttpClient) {
    this.httpOptions = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + LsHelper.getToken(),
      }),
    };
  }

  getAllCategories(): Observable<any> {
    return this.http
      .get(this.apiUrl + 'categories')
      .pipe(map((res: any) => res));
  }

  getAllCourses(): Observable<any> {
    return this.http
      .get(this.apiUrl + 'courses', this.httpOptions)
      .pipe(map((res: any) => res));
  }

  getCoursesByCategoryId(categoryId: string): Observable<any> {
    return this.http
      .get(
        this.apiUrl + 'category/' + categoryId + '/courses',
        this.httpOptions
      )
      .pipe(map((res: any) => res));
  }

  getCourseById(id: any): Observable<any> {
    return this.http
      .get(this.apiUrl + 'course/' + id, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  getCourseByIdNoneUser(id: any): Observable<any> {
    return this.http
      .get(this.apiUrl + 'guest/course/' + id, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  getCategoryById(categoryId: any): Observable<any> {
    return this.http
      .get(this.apiUrl + 'category/' + categoryId)
      .pipe(map((res) => res));
  }

  getUserById(id: string): Observable<any> {
    return this.http
      .get(this.apiUrl + 'user/' + id, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  addReview(review: any, courseId): Observable<any> {
    return this.http
      .post(
        this.apiUrl + 'course/' + courseId + '/reviews',
        review,
        this.httpOptions
      )
      .pipe(map((res: any) => res));
  }

  getCartByUser(): Observable<any> {
    return this.http
      .get(this.apiUrl + 'cart', this.httpOptions)
      .pipe(map((res: any) => res));
  }

  getCurrencyConverted(amount: any): Observable<any> {
    const body = {
      fromCurrency: 'VND',
      toCurrency: 'USD',
      amount: amount,
    };

    return this.http
      .post(this.apiUrl + 'currency', body, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  addCourseToCart(courseId: string): Observable<any> {
    const body = {
      courseId,
    };
    return this.http
      .post(this.apiUrl + 'cart/items', body, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  paidCourses(paymentMethod: string): Observable<any> {
    const body = {
      paymentMethod: paymentMethod,
    };
    return this.http
      .post(this.apiUrl + 'pay', body, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  removeCourseToCart(courseId: string): Observable<any> {
    return this.http
      .put(this.apiUrl + 'cart/items', courseId, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  getAllCoursesByAdmin(): Observable<any> {
    return this.http
      .get(this.apiUrl + 'admin/courses', this.httpOptions)
      .pipe(map((res: any) => res));
  }

  deleteCourseByAdmin(courseId): Observable<any> {
    return this.http
      .delete(this.apiUrl + 'course/' + courseId, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  uploadImage(formData): Observable<any> {
    return this.http
      .post(this.apiUrl + 'uploadimg', formData, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  getAllUsers(): Observable<any> {
    return this.http
      .get(this.apiUrl + 'admin/users', this.httpOptions)
      .pipe(map((res: any) => res));
  }

  getRevenueOfYear(reqYear: number): Observable<any> {
    const body = {
      year: reqYear,
    };
    return this.http
      .post(this.apiUrl + 'analytic/revenue', body, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  getTrendTags(reqYear: number): Observable<any> {
    const body = {
      year: reqYear,
    };
    return this.http
      .post(this.apiUrl + 'analytic/trendtags', body, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  updateCourse(course: Course): Observable<any> {
    return this.http
      .put(
        this.apiUrl + 'category/' + course.categoryId + '/courses',
        course,
        this.httpOptions
      )
      .pipe(map((res: any) => res));
  }

  getAllPromotionsByAdmin(): Observable<any> {
    return this.http
      .get(this.apiUrl + 'admin/promotions', this.httpOptions)
      .pipe(map((res: any) => res));
  }

  addPromotionToCart(promotionCode: string): Observable<any> {
    const body = {
      promotionCode,
    };
    return this.http
      .post(this.apiUrl + 'cart/promotion', body, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  removePromotionToCart(): Observable<any> {
    return this.http
      .put(this.apiUrl + 'cart/promotion', this.httpOptions)
      .pipe(map((res: any) => res));
  }

  deleteItemCart(courseId): Observable<any> {
    return this.http
      .put(this.apiUrl + 'cart/items', { courseId }, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  learnFreeCourse(courseId): Observable<any> {
    return this.http
      .post(this.apiUrl + 'freecourse', { courseId }, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  createPromotionsByAdmin(promotion: Promotion): Observable<any> {
    return this.http
      .post(this.apiUrl + 'admin/promotions', { promotion }, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  deletePromotionsByAdmin(code: string): Observable<any> {
    return this.http
      .delete(this.apiUrl + 'admin/promotions/' + code, this.httpOptions)
      .pipe(map((res: any) => res));
  }

  updateStatusPromotion(code, status): Observable<any> {
    return this.http
      .put(this.apiUrl + 'admin/promotion/setstatus', { code, status }, this.httpOptions)
      .pipe(map((res: any) => res));
  }
}
