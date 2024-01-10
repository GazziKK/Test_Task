import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject, debounceTime, map, startWith, switchMap, takeUntil } from 'rxjs';
import { ForexService } from '../../services/forex.service';
import { MatInputModule } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface ForexResult {
  amount: number;
  base: string;
  ms: number;
  result: {
    rate: number;
    result: number;
    secondCurrency: string;
  }
}
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, OnDestroy {
  public form = new FormGroup({
    first: new FormControl({ value: 'USD', disabled: false }, [Validators.required]),
    second: new FormControl({ value: '', disabled: false }, [Validators.required]),
    amountFirst: new FormControl({ value: 0, disabled: false }, [Validators.pattern("^[0-9]*$")]),
    amountSecond: new FormControl({ value: 0, disabled: true }, [Validators.pattern("^[0-9]*$")]),
  })
  filteredOptions: {
    first: string[],
    second: string[]
  };
  public mainCurrency = true;
  private $destroy = new Subject();
  public forexCurrency: string[] = [];
  public converted: ForexResult;
  constructor(private readonly forexService: ForexService) {

  }

  ngOnInit(): void {
    this.getAllCurrency();
    this.subscribeToForm();
  }


  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.complete();
  }

  private subscribeToForm(): void {
    this.form.valueChanges.pipe(
      startWith(''),
      map(value => {
        return {
          first: this._filter(value['first'] || ''),
          second: this._filter(value['second'] || ''),
        }
      }),
      debounceTime(800),
      takeUntil(this.$destroy)
    ).subscribe({
      next: (value) => {
        this.filteredOptions = value
        this.convertCurrency();
      }
    });
  }

  private getAllCurrency(): void {
    this.forexService.getAll()
      .pipe(
        map((res) => {
          return Object.keys(res.results)
        }),
        takeUntil(this.$destroy)
      )
      .subscribe({
        next: (data) => {
          this.forexCurrency = data;
        }
      })
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.forexCurrency.filter(option => option.toLowerCase().includes(filterValue));
  }

  public changeMainCurrency() {
    this.mainCurrency = !this.mainCurrency
    if (this.mainCurrency) {
      this.form.get('amountFirst')?.enable();
      this.form.get('amountFirst')?.patchValue(this.form.get('amountSecond').value);
      this.form.get('amountSecond')?.disable();
      this.form.get('amountSecond')?.reset();
    } else {
      this.form.get('amountFirst')?.disable();
      this.form.get('amountSecond')?.enable();
      this.form.get('amountSecond')?.patchValue(this.form.get('amountFirst').value);
      this.form.get('amountFirst')?.reset();

    }
    this.convertCurrency()
  }

  private convertCurrency(): void {
    let firstValue = this.form.get('amountFirst').value
    let secondValue = this.form.get('amountSecond').value
    let firstCurrency = this.form.get('first').value
    let secondCurrency = this.form.get('second').value


    if (this.form.valid) {
      if (this.mainCurrency && firstValue) {
        this.fetchConvert(firstCurrency, secondCurrency, firstValue)
      } else if (!this.mainCurrency && secondValue) {
        this.fetchConvert(secondCurrency, firstCurrency, secondValue)

      }
    }
  }

  private fetchConvert(from: string, to: string, amount: number): void {
    this.forexService.convert(from, to, amount).pipe(map((res) => {
      return {
        amount: res.amount,
        base: res.base,
        ms: res.ms,
        result: {
          secondCurrency: Object.keys(res.result)[0],
          result: Object.values(res.result)[0],
          rate: res.result.rate
        }
      }
    }), takeUntil(this.$destroy)).subscribe({
      next: (responseConvert) => {
        this.converted = responseConvert
      }
    })
  }
}
