import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherWidgetComponent} from '../stories/weather-widget/weather-widget.component';
import { WeatherData } from '../stories/weather-widget/models/weather.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WeatherWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('weather');

  weatherData: WeatherData = {
    location: 'The Hague',
    temperature: 13,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    icon: '⛅',
  };
}
