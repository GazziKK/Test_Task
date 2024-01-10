import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ForexService } from '../../services/forex.service';
import { Subject, map, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

interface ForexMap {
  key: string;
  value: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private $destroy = new Subject()
  public forex: ForexMap[] = []

  constructor(private readonly forexService: ForexService) { }


  ngOnInit(): void {
    this.getAllCurrency();
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.complete()
  }

  private getAllCurrency(): void {
    this.forexService.getAll()
      .pipe(
        map((res) => {
          let keys = Object.keys(res.results)
          let values = Object.values(res.results)

          return keys.map((key, index): ForexMap => {
            return {
              key: `${res.base}/${key}`,
              value: values[index]
            }
          });
        }),
        takeUntil(this.$destroy)
      )
      .subscribe({
        next: (data) => {
          this.forex = data;
        }
      })
  }
}
