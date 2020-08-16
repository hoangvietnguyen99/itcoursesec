import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/services/app.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  multi: any[] = [];

  revenues: any[] = [];
  totalYear: number;

  view: any[] = [1000, 400];

  // options
  legend = true;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  showYAxisLabel = true;
  showXAxisLabel = true;
  timeline = true;
  xAxisLabel = 'Month';
  yAxisLabel = 'Count';
  xAxisLabel1 = 'Month';
  yAxisLabel1 = 'VND';

  loading1 = true;
  loading2 = true;
  constructor(private appService: AppService) {
    Object.assign(this, this.multi);
  }

  onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  ngOnInit(): void {
    this.appService.getRevenueOfYear(2020).subscribe(
      (res) => {
        this.revenues = res.revenues;
        this.totalYear = res.totalYear;
        this.loading1 = false;
      },
      (err) => console.log(err)
    );
    this.appService.getTrendTags(2020).subscribe(
      (res) => {
        this.multi = res;
        this.loading2 = false;
      },
      (err) => console.log(err)
    );
  }
}
