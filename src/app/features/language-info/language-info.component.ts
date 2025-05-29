import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-language-info',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './language-info.component.html',
  styleUrls: ['./language-info.component.scss'],
})
export class LanguageInfoComponent implements OnInit {
  allLanguages: string[] = [];
  searchTerm = '';
  filteredLanguages: string[] = [];
  selectedLanguage: string | null = null;

  countries: any[] = [];
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLanguages();
  }

  loadLanguages() {
    this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe({
      next: (data) => {
        const langSet = new Set<string>();
        data.forEach((country) => {
          if (country.languages) {
            (Object.values(country.languages) as string[]).forEach(lang => langSet.add(lang));
          }
        });
        this.allLanguages = Array.from(langSet).sort();
        this.filteredLanguages = [...this.allLanguages];
      },
      error: () => {
        this.error = 'Failed to load languages';
      },
    });
  }
  

  filterLanguages() {
    const term = this.searchTerm.toLowerCase();
    this.filteredLanguages = this.allLanguages.filter((lang) =>
      lang.toLowerCase().includes(term)
    );
  }

  selectLanguage(lang: string) {
    this.selectedLanguage = lang;
    this.loadCountriesByLanguage(lang);
  }

  loadCountriesByLanguage(language: string) {
    this.loading = true;
    this.error = '';
    this.countries = [];

    this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe({
      next: (data) => {
        this.countries = data.filter(country => {
          if (!country.languages) return false;
          return Object.values(country.languages).includes(language);
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load countries';
        this.loading = false;
      }
    });
  }
}
