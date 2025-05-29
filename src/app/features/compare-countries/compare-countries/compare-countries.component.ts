import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compare-countries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compare-countries.component.html',
  styleUrls: ['./compare-countries.component.scss'],
})
export class CompareCountriesComponent implements OnInit {
  allCountries: any[] = [];
  filteredCountries: any[] = [];
  compareList: any[] = [];
  searchTerm = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe({
      next: (data) => (this.allCountries = data),
      error: () => console.error('Failed to fetch countries'),
    });
  }

  onSearchChange() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCountries = this.allCountries.filter((country) =>
      country.name.common.toLowerCase().includes(term)
    );
  }

  addToCompare(country: any) {
    if (!this.compareList.find((c) => c.cca3 === country.cca3)) {
      this.compareList.push(country);
    }
    this.searchTerm = '';
    this.filteredCountries = [];
  }

  getLanguagesString(languages?: Record<string, string>): string {
    return languages ? Object.values(languages).join(', ') : 'N/A';
  }

  getCurrenciesString(currencies?: Record<string, any>): string {
    if (!currencies) return 'N/A';
    return Object.values(currencies)
      .map((c: any) => `${c.name} (${c.symbol})`)
      .join(', ');
  }
}
