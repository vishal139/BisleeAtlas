import { Routes } from '@angular/router';
import { CountryExplorerComponent } from './features/country-explorer/country-explorer.component';
import { CountryDetailsComponent } from './features/country-details/country-details.component';
import { CountryQuizComponent } from './features/country-quiz/country-quiz.component';
import { TravelWishlistComponent } from './features/travel-wishlist/travel-wishlist.component';
import { CurrencyConverterComponent } from './features/currency-converter/currency-converter.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then((c) => c.HomeComponent),
  },
  { path: 'explore', component: CountryExplorerComponent },
  { path: 'country/:code', component: CountryDetailsComponent },
  { path: 'quiz', component: CountryQuizComponent },
  {
    path: 'wishlist',
    component: TravelWishlistComponent,
  },
  {
    path: 'converter',
    component: CurrencyConverterComponent,
  },
  {
    path: 'map',
    loadComponent: () =>
      import('./features/map-visualization/map-visualization.component').then(
        (m) => m.MapVisualizationComponent
      ),
  },
  {
    path: 'languages',
    loadComponent: () =>
      import('./features/language-info/language-info.component').then(
        (m) => m.LanguageInfoComponent
      ),
  },
  {
    path: 'memory',
    loadComponent: () =>
      import('./features/flag-memory-game/flag-memory-game.component').then(m => m.FlagMemoryGameComponent)
  },
  
  {
    path: 'compare',
    loadComponent: () =>
      import(
        './features/compare-countries/compare-countries/compare-countries.component'
      ).then((m) => m.CompareCountriesComponent),
  },

  { path: '', redirectTo: 'explore', pathMatch: 'full' },
  { path: '**', redirectTo: 'explore' },

  // other routes ...
];
