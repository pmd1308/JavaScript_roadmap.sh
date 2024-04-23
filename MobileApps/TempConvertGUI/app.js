// temperature conversion tool built with React Native. It allows users to seamlessly convert temperatures between Celsius, Fahrenheit, and Kelvin, with offline support and customizable presets.

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Share, TextInput, Picker, Button } from 'react-native';
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import AsyncStorage from '@react-native-community/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { BarChart } from 'react-native-chart-kit';

// Importing components
import Chart from './components/Chart';
import ConversionForm from './components/ConversionForm';
import History from './components/History';
import Presets from './components/Presets';

// Importing utility files
import convertTemperatureOffline from './utils/temperatureConversion';
import { loadData, saveData } from './utils/AsyncStorage';
import useGeolocation from './utils/Geolocation';

const translations = {
    en: require('./translations/en.json'), // Fix error: 'requestAnimationFrame' to 'require'
    es: require('./translations/es.json'), // Fix error: 'requestAnimationFrame' to 'require'
    fr: require('./translations/fr.json'), // Fix error: 'requestAnimationFrame' to 'require'
}

i18n.translations = translations;

export const App = () => {
    const [value, setValue] = useState('');
    const [fromUnit, setFromUnit] = useState('');
    const [toUnit, setToUnit] = useState('');
    const [convertedValue, setConvertedValue] = useState('');
    const [decimalPlaces, setDecimalPlaces] = useState(2);
    const [presets, setPresets] = useState([]);
    const [history, setHistory] = useState([]);
    const [currentWeather, setCurrentWeather] = useState(null);

    useEffect(() => {
        // Set the initial language based on the device locale
        const deviceLocale = RNLocalize.getLocales()[0]?.languageCode;
        i18n.locale = deviceLocale;

        loadPresets();
        loadHistory();

        // Fetch current weather based on user's location
        fetchCurrentWeather();
    }, []);

    const temperatureUnits = ['Celsius', 'Fahrenheit', 'Kelvin'];
    const conversionFactors = {
        Celsius: [1, 1.8, 1],
        Fahrenheit: [0.5556, 1, 0.5556],
        Kelvin: [1, 1.8, 1],
    };


    const generateChartData = () => {
        return temperatureUnits.map((unit) => {
            return {
                name: unit,
                conversionFactor: conversionFactors[unit], // Fix error: 'conversionFactors'
            };
        });
    };

    const isValidNumber = (input) => {
        const regex = /^-?\d*\.?\d*$/; // Allows decimal and negative numbers
        return regex.test(input);
    };

    const handleInputChange = (text) => {
        if (isValidNumber(text)) {
            setValue(text);
        } else {
            Alert.alert(i18n.t('invalidInputTitle'), i18n.t('invalidInputMessage'));
            setValue('');
        }
    };

    const handleFromUnitChange = (selectedUnit) => {
        setFromUnit(selectedUnit);
    };

    const handleToUnitChange = (selectedUnit) => {
        setToUnit(selectedUnit);
    };

    const handleDecimalChange = (value) => {
        setDecimalPlaces(Math.round(value));
    };

    const convertedTemperature = () => {
        try {
            let converted;
            const temperature = parseFloat(value);
            converted = converteTemperature(value, fromUnit, toUnit);
            setConvertedValue(converted.toFixed(decimalPlaces));
            saveToHistory({ value, fromUnit, toUnit, converted.toFixed(decimalPlaces) });
        } catch (error) {
            console.error('Error converting temperature:', error.message);
            Alert.alert(i18n.t('conversionErrorTitle'), i18n.t('conversionErrorMessage'));
          }
        };

    const shareConversion = () => {
        const message = `${value} ${fromUnit} = ${convertedValue} ${toUnit}`;
        Share.share({
            message: message,
            title: i18n.t('shareTitle'),
        });
    };

    const savePreset = async () => {
        try {
            const newPreset = {
                fromUnit,
                toUnit,
                name: `Custom ${presets.length + 1}`
            };
            const updatedPresets = [...presets, newPreset];
            setPresets(updatedPresets);
            await saveData('presets', updatedPresets);
        } catch (error) {
            console.error('Error saving preset:', error.message);
            Alert.alert(i18n.t('savePresetErrorTitle'), i18n.t('savePresetErrorMessage'));
        }
    };

    const saveToHistory = async (conversion) => {
        try {
            const updatedHistory = [conversion, ...history];
            setHistory(updatedHistory);
            await saveData('history', updatedHistory);
        } catch (error) {
            console.error('Error saving to history:', error.message);
            Alert.alert(i18n.t('saveHistoryErrorTitle'), i18n.t('saveHistoryErrorMessage'));
        }
    };

    const loadPresets = async () => {
        try {
            const data = await loadData('presets');
            setPresets(data);
        } catch (error) {
            console.error('Error loading presets:', error.message);
            Alert.alert(i18n.t('loadPresetErrorTitle'), i18n.t('loadPresetErrorMessage'));
        }
    };

    const loadHistory = async () => {
        try {
            const data = await loadData('history');
            setHistory(data);
        } catch (error) {
            console.error('Error loading history:', error.message);
            Alert.alert(i18n.t('loadHistoryErrorTitle'), i18n.t('loadHistoryErrorMessage'));
        }
    };

    const fetchCurrentWeather = async () => {
        try {
            const { latitude, longitude } = await useGeolocation();
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            setCurrentWeather(data);
        } catch (error) {
            console.error('Error fetching current weather:', error.message);
            Alert.alert(i18n.t('fetchWeatherErrorTitle'), i18n.t('fetchWeatherErrorMessage'));
        }
    };

    return (
        <View style={styles.container} accessible={true} accessibilityLabel={i18n.t('appTitle')}>
            <Text style={styles.title} accessibilityRole="header">{i18n.t('appTitle')}</Text>

            {/* Chart to visualize conversion factors */}
            <Chart conversionFactors={generateChartData()} />

            {/* Conversion form */}
            <ConversionForm
                value={value}
                onInputChange={handleInputChange}
                fromUnit={fromUnit}
                onFromUnitChange={handleFromUnitChange}
                toUnit={toUnit}
                onToUnitChange={handleToUnitChange}
                decimalPlaces={decimalPlaces}
                onDecimalChange={handleDecimalChange}
                onConvert={convertedTemperature}
                onShare={shareConversion}
            />

            {/* History component */}
            <History data={history} />

            {/* Presets component */}
            <Presets presets={presets} onSavePreset={savePreset} />

            {/* Display current weather */}
            {currentWeather && <Text style={styles.currentWeather}>{i18n.t('currentWeatherLabel')}: {currentWeather}°C</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    currentWeather: {
        marginTop: 10,
        fontSize: 16,
    },
});