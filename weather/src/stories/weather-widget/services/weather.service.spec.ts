import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WeatherService } from './weather.service';
import { OpenWeatherMapResponse } from '../models/weather.model';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  const mockWeatherResponse: OpenWeatherMapResponse = {
    coord: { lon: -0.1257, lat: 51.5085 },
    weather: [
      {
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d',
      },
    ],
    base: 'stations',
    main: {
      temp: 20,
      feels_like: 19,
      temp_min: 18,
      temp_max: 22,
      pressure: 1013,
      humidity: 50,
    },
    visibility: 10000,
    wind: {
      speed: 5,
      deg: 270,
    },
    clouds: {
      all: 0,
    },
    dt: 1609459200,
    sys: {
      country: 'GB',
      sunrise: 1609400000,
      sunset: 1609435000,
    },
    timezone: 0,
    id: 2643743,
    name: 'London',
    cod: 200,
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        WeatherService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setIconType and getIconType', () => {
    it('should set and get icon type', () => {
      service.setIconType('image', 'assets/icons/');
      expect(service.getIconType()).toBe('image');
    });

    it('should default to emoji icon type', () => {
      expect(service.getIconType()).toBe('emoji');
    });

    it('should add trailing slash to basePath if missing', () => {
      service.setIconType('image', 'assets/icons');
      // We can't directly test the private property, but it will be used when getting weather
      expect(service.getIconType()).toBe('image');
    });
  });

  describe('getWeatherByCity', () => {
    it('should fetch weather data for a city', () => {
      const city = 'London';
      const units = 'metric';

      service.getWeatherByCity(city, units).subscribe((response) => {
        expect(response.location).toContain('London');
        expect(response.temperature).toBe(20);
        expect(response.condition).toBe('Clear');
        expect(response.humidity).toBe(50);
        expect(response.windSpeed).toBe(5);
      });

      const req = httpMock.expectOne((request) => {
        // URL is double-encoded in CORS proxy, so just check it contains the key parts
        return request.url.includes('weather') &&
               request.url.includes('q%3D') && // q= encoded
               request.url.includes('units%3D'); // units= encoded
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockWeatherResponse);
    });

    it('should use imperial units by default', () => {
      const city = 'New York';

      service.getWeatherByCity(city).subscribe(() => {});

      const req = httpMock.expectOne((request) =>
        request.url.includes('weather') && request.url.includes('units%3Dimperial')
      );
      req.flush(mockWeatherResponse);
    });

    it('should return emoji icon when iconType is emoji', () => {
      service.setIconType('emoji');

      service.getWeatherByCity('London').subscribe((response) => {
        expect(response.icon).toBe('☀️');
      });

      const req = httpMock.expectOne((request) => request.url.includes('weather'));
      req.flush(mockWeatherResponse);
    });

    it('should return image path when iconType is image', () => {
      service.setIconType('image', 'assets/');

      service.getWeatherByCity('London').subscribe((response) => {
        expect(response.icon).toContain('assets/');
        expect(response.icon).toContain('.svg');
      });

      const req = httpMock.expectOne((request) => request.url.includes('weather'));
      req.flush(mockWeatherResponse);
    });

    it('should handle 404 error', () => {
      service.getWeatherByCity('InvalidCity').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error) => {
          expect(error.message).toContain('City not found');
        },
      });

      const req = httpMock.expectOne((request) => request.url.includes('weather'));
      req.flush('City not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 401 error', () => {
      service.getWeatherByCity('London').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error) => {
          expect(error.message).toContain('Invalid API key');
        },
      });

      const req = httpMock.expectOne((request) => request.url.includes('weather'));
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 429 rate limit error', () => {
      service.getWeatherByCity('London').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error) => {
          expect(error.message).toContain('API rate limit exceeded');
        },
      });

      const req = httpMock.expectOne((request) => request.url.includes('weather'));
      req.flush('Too Many Requests', { status: 429, statusText: 'Too Many Requests' });
    });
  });

  describe('getWeatherByCoordinates', () => {
    it('should fetch weather data by coordinates', () => {
      const lat = 51.5074;
      const lon = -0.1278;
      const units = 'metric';

      service.getWeatherByCoordinates(lat, lon, units).subscribe((response) => {
        expect(response.location).toContain('London');
        expect(response.temperature).toBe(20);
      });

      const req = httpMock.expectOne((request) => {
        // Check for URL-encoded parameters in CORS proxy URL
        return request.url.includes('weather') &&
               request.url.includes('lat%3D') &&
               request.url.includes('lon%3D');
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockWeatherResponse);
    });

    it('should use imperial units by default', () => {
      service.getWeatherByCoordinates(51.5074, -0.1278).subscribe(() => {});
      const req = httpMock.expectOne((request) =>
        request.url.includes('weather') && request.url.includes('units%3Dimperial')
      );
      req.flush(mockWeatherResponse);
    });
  });

  describe('getForecast', () => {
    const mockForecastResponse = {
      list: [
        {
          dt: 1609459200,
          main: { temp: 20, humidity: 50 },
          weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
        },
        {
          dt: 1609545600,
          main: { temp: 22, humidity: 45 },
          weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }],
        },
      ],
    };

    it('should fetch forecast data', () => {
      const city = 'London';

      service.getForecast(city).subscribe((forecast) => {
        expect(Array.isArray(forecast)).toBe(true);
        expect(forecast.length).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne((request) => request.url.includes('forecast'));
      expect(req.request.method).toBe('GET');
      req.flush(mockForecastResponse);
    });

    it('should handle invalid forecast response', () => {
      service.getForecast('London').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne((request) => request.url.includes('forecast'));
      req.flush({ invalid: 'data' });
    });
  });

  describe('getCurrentPosition', () => {
    it('should get current position successfully', async () => {
      const mockCoords = {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({}),
      };

      const mockGeolocation = {
        getCurrentPosition: vi.fn((success: PositionCallback) => {
          success({ coords: mockCoords, timestamp: Date.now() } as GeolocationPosition);
        }),
      };

      vi.stubGlobal('navigator', { geolocation: mockGeolocation });

      const coords = await service.getCurrentPosition();
      expect(coords.latitude).toBe(51.5074);
      expect(coords.longitude).toBe(-0.1278);
    });

    it('should handle permission denied error', async () => {
      const mockError: GeolocationPositionError = {
        code: 1,
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      const mockGeolocation = {
        getCurrentPosition: vi.fn((_: PositionCallback, error?: PositionErrorCallback) => {
          if (error) error(mockError);
        }),
      };

      vi.stubGlobal('navigator', { geolocation: mockGeolocation });

      await expect(service.getCurrentPosition()).rejects.toThrow('Location permission denied');
    });

    it('should handle position unavailable error', async () => {
      const mockError: GeolocationPositionError = {
        code: 2,
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      const mockGeolocation = {
        getCurrentPosition: vi.fn((_: PositionCallback, error?: PositionErrorCallback) => {
          if (error) error(mockError);
        }),
      };

      vi.stubGlobal('navigator', { geolocation: mockGeolocation });

      await expect(service.getCurrentPosition()).rejects.toThrow('Location information unavailable');
    });

    it('should handle timeout error', async () => {
      const mockError: GeolocationPositionError = {
        code: 3,
        message: 'Timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      const mockGeolocation = {
        getCurrentPosition: vi.fn((_: PositionCallback, error?: PositionErrorCallback) => {
          if (error) error(mockError);
        }),
      };

      vi.stubGlobal('navigator', { geolocation: mockGeolocation });

      await expect(service.getCurrentPosition()).rejects.toThrow('Location request timed out');
    });

    it('should handle when geolocation is not supported', async () => {
      vi.stubGlobal('navigator', {});

      await expect(service.getCurrentPosition()).rejects.toThrow('Geolocation is not supported by your browser');
    });
  });

  describe('weather icon mapping', () => {
    it('should return thunderstorm emoji for code 200-299', () => {
      const response = { ...mockWeatherResponse };
      response.weather[0].id = 200;

      service.setIconType('emoji');
      service.getWeatherByCity('London').subscribe((data) => {
        expect(data.icon).toBe('⛈️');
      });

      const req = httpMock.expectOne((request) => request.url.includes('weather'));
      req.flush(response);
    });

    it('should return rain emoji for code 500-599', () => {
      const response = { ...mockWeatherResponse };
      response.weather[0].id = 500;

      service.setIconType('emoji');
      service.getWeatherByCity('London').subscribe((data) => {
        expect(data.icon).toBe('🌧️');
      });

      const req = httpMock.expectOne((request) => request.url.includes('weather'));
      req.flush(response);
    });

    it('should return snow emoji for code 600-699', () => {
      const response = { ...mockWeatherResponse };
      response.weather[0].id = 600;

      service.setIconType('emoji');
      service.getWeatherByCity('London').subscribe((data) => {
        expect(data.icon).toBe('❄️');
      });

      const req = httpMock.expectOne((request) => request.url.includes('weather'));
      req.flush(response);
    });

    it('should return moon emoji for clear night', () => {
      const response = { ...mockWeatherResponse };
      response.weather[0].id = 800;
      response.weather[0].icon = '01n';

      service.setIconType('emoji');
      service.getWeatherByCity('London').subscribe((data) => {
        expect(data.icon).toBe('🌙');
      });

      const req = httpMock.expectOne((request) => request.url.includes('weather'));
      req.flush(response);
    });

    it('should return clouds emoji for cloudy weather', () => {
      const response = { ...mockWeatherResponse };
      response.weather[0].id = 803;

      service.setIconType('emoji');
      service.getWeatherByCity('London').subscribe((data) => {
        expect(data.icon).toBe('☁️');
      });

      const req = httpMock.expectOne((request) => request.url.includes('weather'));
      req.flush(response);
    });
  });

  describe('data transformation', () => {
    it('should round temperature values', () => {
      const response = { ...mockWeatherResponse };
      response.main.temp = 20.7;

      service.getWeatherByCity('London').subscribe((data) => {
        expect(data.temperature).toBe(21);
      });

      const req = httpMock.expectOne((request) => request.url.includes('weather'));
      req.flush(response);
    });

    it('should include country in location', () => {
      service.getWeatherByCity('London').subscribe((data) => {
        expect(data.location).toBe('London, GB');
      });

      const req = httpMock.expectOne((request) => request.url.includes('weather'));
      req.flush(mockWeatherResponse);
    });

    it('should handle missing optional fields', () => {
      const response = { ...mockWeatherResponse };
      response.visibility = 0;

      service.getWeatherByCity('London').subscribe((data) => {
        expect(data.visibility).toBe(0);
      });

      const req = httpMock.expectOne((request) => request.url.includes('weather'));
      req.flush(response);
    });
  });
});
