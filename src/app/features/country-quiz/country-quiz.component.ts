import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Country {
  name: { common: string };
  capital?: string[];
  flags: { png: string };
  population: number;
  currencies?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
  region: string;
}

interface Question {
  type: 'capital' | 'flag' | 'population' | 'currency' | 'language' | 'region';
  questionText: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
}

@Component({
  selector: 'app-country-quiz',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './country-quiz.component.html',
  styleUrls: ['./country-quiz.component.scss'],
})
export class CountryQuizComponent implements OnInit {
  countries: Country[] = [];
  loading = true;
  error = '';

  question: Question | null = null;
  score = 0;
  questionNumber = 0;
  totalQuestions = 10;
  answered = false;
  selectedOption: string | null = null;

  questionTypes: Question['type'][] = [
    'capital',
    'flag',
    'population',
    'currency',
    'language',
    'region',
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Country[]>('https://restcountries.com/v3.1/all').subscribe({
      next: (data) => {
        this.countries = data.filter(c => c.name && c.region); // simple filter
        this.loading = false;
        this.nextQuestion();
      },
      error: () => {
        this.error = 'Failed to load country data.';
        this.loading = false;
      },
    });
  }

  nextQuestion() {
    this.answered = false;
    this.selectedOption = null;

    if (this.questionNumber >= this.totalQuestions) {
      this.question = null; // quiz finished
      return;
    }

    this.questionNumber++;
    this.question = this.generateRandomQuestion();
  }

  generateRandomQuestion(): Question {
    const type =
      this.questionTypes[
        Math.floor(Math.random() * this.questionTypes.length)
      ];

    switch (type) {
      case 'capital':
        return this.generateCapitalQuestion();
      case 'flag':
        return this.generateFlagQuestion();
      case 'population':
        return this.generatePopulationQuestion();
      case 'currency':
        return this.generateCurrencyQuestion();
      case 'language':
        return this.generateLanguageQuestion();
      case 'region':
        return this.generateRegionQuestion();
      default:
        return this.generateCapitalQuestion();
    }
  }

  getRandomCountry(): Country {
    const idx = Math.floor(Math.random() * this.countries.length);
    return this.countries[idx];
  }

  shuffleArray(arr: any[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  generateCapitalQuestion(): Question {
    let country = this.getRandomCountry();
    while (!country.capital || country.capital.length === 0) {
      country = this.getRandomCountry();
    }
    const correctAnswer = country.capital![0];

    const options = [correctAnswer];
    while (options.length < 4) {
      const randomCapital = this.getRandomCountry().capital?.[0];
      if (randomCapital && !options.includes(randomCapital)) {
        options.push(randomCapital);
      }
    }
    this.shuffleArray(options);

    return {
      type: 'capital',
      questionText: `What is the capital of ${country.name.common}?`,
      options,
      correctAnswer,
    };
  }

  generateFlagQuestion(): Question {
    const country = this.getRandomCountry();
    const correctAnswer = country.name.common;

    const options = [correctAnswer];
    while (options.length < 4) {
      const randomName = this.getRandomCountry().name.common;
      if (!options.includes(randomName)) {
        options.push(randomName);
      }
    }
    this.shuffleArray(options);

    return {
      type: 'flag',
      questionText: `Which country does this flag belong to?`,
      imageUrl: country.flags.png,
      options,
      correctAnswer,
    };
  }

  generatePopulationQuestion(): Question {
    const country = this.getRandomCountry();
    const correctAnswer = country.name.common;

    // pick 3 other random countries for options
    const options = [correctAnswer];
    while (options.length < 4) {
      const randomCountry = this.getRandomCountry();
      if (!options.includes(randomCountry.name.common)) {
        options.push(randomCountry.name.common);
      }
    }
    this.shuffleArray(options);

    return {
      type: 'population',
      questionText: `Which country has a population closest to ${country.population.toLocaleString()}?`,
      options,
      correctAnswer,
    };
  }

  generateCurrencyQuestion(): Question {
    let country = this.getRandomCountry();
    while (!country.currencies || Object.keys(country.currencies).length === 0) {
      country = this.getRandomCountry();
    }
    const currencyNames = Object.values(country.currencies).map(c => c.name);
    const correctAnswer = currencyNames[0];

    const options = [correctAnswer];
    while (options.length < 4) {
      const randomCountry = this.getRandomCountry();
      const randomCurrencies = randomCountry.currencies ? Object.values(randomCountry.currencies).map(c => c.name) : [];
      const randomCurrency = randomCurrencies[0];
      if (randomCurrency && !options.includes(randomCurrency)) {
        options.push(randomCurrency);
      }
    }
    this.shuffleArray(options);

    return {
      type: 'currency',
      questionText: `What currency is used in ${country.name.common}?`,
      options,
      correctAnswer,
    };
  }

  generateLanguageQuestion(): Question {
    let country = this.getRandomCountry();
    while (!country.languages || Object.keys(country.languages).length === 0) {
      country = this.getRandomCountry();
    }
    const languages = Object.values(country.languages);
    const correctAnswer = languages.join(', ');

    const options = [correctAnswer];
    while (options.length < 4) {
      const randomCountry = this.getRandomCountry();
      const randomLanguages = randomCountry.languages ? Object.values(randomCountry.languages).join(', ') : '';
      if (randomLanguages && !options.includes(randomLanguages)) {
        options.push(randomLanguages);
      }
    }
    this.shuffleArray(options);

    return {
      type: 'language',
      questionText: `Which language(s) is/are spoken in ${country.name.common}?`,
      options,
      correctAnswer,
    };
  }

  generateRegionQuestion(): Question {
    const regions = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic'];
    const country = this.getRandomCountry();
    const correctAnswer = country.region;

    const options = [correctAnswer];
    while (options.length < 4) {
      const randomRegion = regions[Math.floor(Math.random() * regions.length)];
      if (!options.includes(randomRegion)) {
        options.push(randomRegion);
      }
    }
    this.shuffleArray(options);

    return {
      type: 'region',
      questionText: `In which region is ${country.name.common} located?`,
      options,
      correctAnswer,
    };
  }

  selectOption(option: string) {
    if (this.answered) return;

    this.selectedOption = option;
    this.answered = true;

    if (option === this.question?.correctAnswer) {
      this.score++;
    }
  }

  restartQuiz() {
    this.score = 0;
    this.questionNumber = 0;
    this.answered = false;
    this.selectedOption = null;
    this.nextQuestion();
  }
  
  
}
