import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-currency-converter',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.scss']
})
export class CurrencyConverterComponent implements OnInit {
  currencies: string[] = [];
  fromCurrency = 'USD';
  toCurrency = 'INR';
  amount = 1;
  convertedAmount: number | null = null;

  loading = true;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('https://api.exchangerate.host/symbols').subscribe({
      next: (data) => {
        this.currencies = Object.keys(data.symbols);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load currencies.';
        this.loading = false;
      }
    });
  }

  convert() {
    this.loading = true;
    this.convertedAmount = null;
    const url = `https://api.exchangerate.host/convert?from=${this.fromCurrency}&to=${this.toCurrency}&amount=${this.amount}`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.convertedAmount = data.result;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to convert currency.';
        this.loading = false;
      }
    });
  }
}
