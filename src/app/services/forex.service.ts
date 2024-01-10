import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface ForexRes {
  base: string;
  ms: number;
  updated: Date
  results: ForexData
}

interface ForexData {
  [key: string]: string;
}

interface ConvertRes {
  base: string;
  amount: number;
  result: {
    [key: string]: number;
    rate: number;
  },
  ms: number;
}

@Injectable({
  providedIn: 'root'
})
export class ForexService {
  private url = 'https://api.fastforex.io/'
  private token = '02186dfd26-2ab639be44-s71pr5'

  constructor(private readonly http: HttpClient) { }

  public getAll(): Observable<ForexRes> {
    return this.http.get<ForexRes>(`${this.url}fetch-all?from=USD&api_key=${this.token}`)
  }

  public convert(from: string, to: string, amount: number): Observable<ConvertRes> {
    return this.http.get<ConvertRes>(`${this.url}convert?from=${from}&to=${to}&amount=${amount}&api_key=${this.token}`)
  }
}
