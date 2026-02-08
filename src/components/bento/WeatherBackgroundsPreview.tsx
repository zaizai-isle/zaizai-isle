"use client";

import { getWeatherGradient, WEATHER_CONDITIONS_LIST } from "./WeatherCard";

export function WeatherBackgroundsPreview() {
    return (
        <div className="w-full p-6 space-y-8">
            <div>
                <h2 className="text-xl font-bold mb-4 text-white">Weather Backgrounds Preview</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {WEATHER_CONDITIONS_LIST.map((condition) => (
                        <div key={condition} className="space-y-2">
                            {/* Day */}
                            <div
                                className="aspect-[3/4] rounded-2xl shadow-lg flex flex-col items-center justify-center text-white p-4 relative overflow-hidden"
                                style={{ background: getWeatherGradient(condition, true) }}
                            >
                                <span className="font-semibold z-10">{condition}</span>
                                <span className="text-xs opacity-70 z-10">Day</span>
                            </div>

                            {/* Night */}
                            <div
                                className="aspect-[3/4] rounded-2xl shadow-lg flex flex-col items-center justify-center text-white p-4 relative overflow-hidden"
                                style={{ background: getWeatherGradient(condition, false) }}
                            >
                                <span className="font-semibold z-10">{condition}</span>
                                <span className="text-xs opacity-70 z-10">Night</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}