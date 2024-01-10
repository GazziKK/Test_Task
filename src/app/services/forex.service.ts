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
}
