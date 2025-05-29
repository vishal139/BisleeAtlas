import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Country {
  name: { common: string };
  flags: { png: string };
  region: string;
  population: number;
  capital?: string[];
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol: string }>;
  cca3: string;
}

@Component({
  selector: 'app-country-explorer',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './country-explorer.component.html',
  styleUrls: ['./country-explorer.component.scss'],
})
export class CountryExplorerComponent implements OnInit {
  countries: Country[] = [];
  filteredCountries: Country[] = [];
  selectedCountry: Country | null = null;
  searchTerm = '';
  loading = false;
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loading = true;
    this.http.get<Country[]>('https://restcountries.com/v3.1/all').subscribe({
      next: (data) => {
        this.countries = data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        this.filteredCountries = this.countries;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load countries.';
        this.loading = false;
      },
    });
  }

  onSearchChange() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCountries = this.countries.filter((c) =>
      c.name.common.toLowerCase().includes(term)
    );
    this.selectedCountry = null;
  }

  selectCountry(country: Country) {
    console.log(country, 'this is my countary')
    this.selectedCountry = country;
    // window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate(['/country', country.cca3]);
  }

  getCurrenciesString(currencies?: Record<string, { name: string; symbol: string }>): string {
    if (!currencies) return 'N/A';
    return Object.values(currencies)
      .map(c => `${c.name} (${c.symbol})`)
      .join(', ');
  }

  getLanguagesString(languages?: Record<string, string>): string {
    if (!languages) return 'N/A';
    return Object.values(languages).join(', ');
  }
  
}
