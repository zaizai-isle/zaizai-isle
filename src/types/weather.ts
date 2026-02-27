export interface WeatherData {
    temp: number;
    condition: string;
    iconCode?: number;
    location: string;
    humidity: number;
    windSpeed: number;
    feelsLike: number;
    isDay: boolean;
    minTemp: number;
    maxTemp: number;
}
