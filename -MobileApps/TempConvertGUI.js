import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Picker, Button, Slider, StyleSheet, Alert, AsyncStorage, Share, ActivityIndicator } from 'react-native'; // Added ActivityIndicator
import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import Geolocation from '@react-native-community/geolocation';
import { BarChart } from 'react-native-chart-kit';

// Define translations for different languages
const translations = {
 en: require('./translations/en.json'), // English
 fr: require('./translations/fr.json'), // French
 es: require('./translations/es.json'), // Spanish
 // Add more languages as needed
};

i18n.translations = translations;

const App = () => {
 const [value, setValue] = useState('');
 const [fromUnit, setFromUnit] = useState('');
 const [toUnit, setToUnit] = useState('');
 const [convertedValue, setConvertedValue] = useState('');
 const [decimalPlaces, setDecimalPlaces] = useState(2);
 const [presets, setPresets] = useState([]);
 const [history, setHistory] = useState([]);
 const [currentWeather, setCurrentWeather] = useState(null);
 const [loading, setLoading] = useState(false); // Added loading state
 const [isValidInput, setIsValidInput] = useState(true);

 useEffect(() => {
  // Set the initial language based on the device locale
  const deviceLocale = RNLocalize.getLocales()[0]?.languageCode;
  i18n.locale = deviceLocale;

  // Load presets and history from AsyncStorage
  loadPresets();
  loadHistory();

  // Fetch current weather based on user's location
  fetchCurrentWeather();
 }, []);

 // Define temperature units and conversion factors
 const temperatureUnits = ['Celsius', 'Fahrenheit', 'Kelvin'];
 const conversionFactors = {
  Celsius: [1, 1.8, 1],
  Fahrenheit: [0.5556, 1, 0.5556],
  Kelvin: [1, 1.8, 1],
 };

 // Define a function to convert temperature offline
 const convertTemperatureOffline = (input, fromUnit, toUnit) => {
  let converted;
  const temperature = parseFloat(input);
   
  // Implement custom conversion based on fromUnit and toUnit
  switch (fromUnit) {
   case 'Celsius':
    switch (toUnit) {
     case 'Fahrenheit':
      converted = (temperature * 9/5) + 32;
      break;
     case 'Kelvin':
      converted = temperature + 273.15;
      break;
     default:
      converted = temperature;
      break;
    }
    break;
   case 'Fahrenheit':
    switch (toUnit) {
     case 'Celsius':
      converted = (temperature - 32) * 5/9;
      break;
     case 'Kelvin':
      converted = (temperature - 32) * 5/9 + 273.15;
      break;
     default:
      converted = temperature;
      break;
    }
    break;
   case 'Kelvin':
    switch (toUnit) {
     case 'Celsius':
      converted = temperature - 273.15;
      break;
     case 'Fahrenheit':
      converted = (temperature - 273.15) * 9/5 + 32;
      break;
     default:
      converted = temperature;
      break;
    }
    break;
   default:
    converted = temperature;
    break;
  }

  return converted.toFixed(decimalPlaces);
 };

 const handleInputChange = (text) => {
    const regex = /^-?\d*\.?\d*$/; // Allows decimal and negative numbers
    if (regex.test(text)) {
      setValue(text);
      setIsValidInput(true); // Set input validity to true when input is valid
    } else {
      setValue(text);
      setIsValidInput(false); // Set input validity to false when input is invalid
      Alert.alert(i18n.t('invalidInputTitle'), i18n.t('invalidInputMessage'));
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

 const convertTemperature = () => {
  try {
   const converted = convertTemperatureOffline(value, fromUnit, toUnit);
   setConvertedValue(converted);
   saveToHistory({ value, fromUnit, toUnit, converted });
  } catch (error) {
   console.error('Error converting temperature:', error.message);
   Alert.alert(i18n.t('conversionErrorTitle'), i18n.t('conversionErrorMessage'));
  }
 };

 const saveToHistory = async (conversion) => {
    try {
      // Using async/await syntax to asynchronously set item in AsyncStorage
      const updatedHistory = [conversion, ...history];
      await AsyncStorage.setItem('history', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving to history:', error.message);
      Alert.alert(i18n.t('saveToHistoryErrorTitle'), i18n.t('saveToHistoryErrorMessage'));
    }
  };
  
  const loadPresets = async () => {
    try {
      // Using async/await syntax to asynchronously get item from AsyncStorage
      const savedPresets = await AsyncStorage.getItem('presets');
      if (savedPresets) {
        setPresets(JSON.parse(savedPresets));
      }
    } catch (error) {
      console.error('Error loading presets:', error.message);
      Alert.alert(i18n.t('loadPresetsErrorTitle'), i18n.t('loadPresetsErrorMessage'));
    }
  };
  
  const loadHistory = async () => {
    try {
      // Using async/await syntax to asynchronously get item from AsyncStorage
      const savedHistory = await AsyncStorage.getItem('history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading history:', error.message);
      Alert.alert(i18n.t('loadHistoryErrorTitle'), i18n.t('loadHistoryErrorMessage'));
    }
  };
  
  const fetchCurrentWeather = async () => {
    setLoading(true); // Set loading to true when fetching starts
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
          const apiUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
          try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setCurrentWeather(data.main.temp);
            resolve();
          } catch (error) {
            console.error('Error fetching current weather:', error.message);
            Alert.alert(i18n.t('fetchWeatherErrorTitle'), i18n.t('fetchWeatherErrorMessage'));
            reject(error);
          } finally {
            setLoading(false); // Set loading to false when fetching ends
          }
        },
        (error) => {
          console.error('Error getting current position:', error.message);
          Alert.alert(i18n.t('positionErrorTitle'), i18n.t('positionErrorMessage'));
          setLoading(false); // Set loading to false in case of error
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };
  
  const shareConversion = async () => {
    const message = i18n.t('shareMessage', { value, fromUnit, convertedValue, toUnit }); // Construct the message
    try {
      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error('Error sharing conversion:', error.message);
      // Handle error sharing conversion
      Alert.alert(i18n.t('shareErrorTitle'), i18n.t('shareErrorMessage'));
    }
  };
  
  
 return (
  <View style={styles.container} accessible={true} accessibilityLabel={i18n.t('appTitle')}>
    <Text style={styles.title} accessibilityRole="header">{i18n.t('appTitle')}</Text>

    {/* Rest of the UI components */}
    
    {/* Loading indicator */}
    {loading && <ActivityIndicator size="large" color="#0000ff" />}

    <TextInput
    style={[styles.input, !isValidInput && styles.invalidInput]} // Apply invalidInput style if input is invalid
    value={value}
    onChangeText={handleInputChange}
    placeholder={i18n.t('inputPlaceholder')}
    keyboardType="numeric"
    />

    <View style={styles.pickerContainer}>
      <Picker
        style={styles.picker}
        selectedValue={fromUnit}
        onValueChange={handleFromUnitChange}
      >
        {temperatureUnits.map(unit => (
          <Picker.Item key={unit} label={unit} value={unit} />
        ))}
      </Picker>
      <Text style={styles.pickerText}>{i18n.t('fromUnitLabel')}</Text>
    </View>

    <View style={styles.pickerContainer}>
      <Picker
        style={styles.picker}
        selectedValue={toUnit}
        onValueChange={handleToUnitChange}
      >
        {temperatureUnits.map(unit => (
          <Picker.Item key={unit} label={unit} value={unit} />
        ))}
      </Picker>
      <Text style={styles.pickerText}>{i18n.t('toUnitLabel')}</Text>
    </View>

    <Slider
      style={styles.slider}
      value={decimalPlaces}
      onValueChange={handleDecimalChange}
      minimumValue={0}
      maximumValue={4}
      step={1}
    />
    <Text style={styles.sliderText}>{i18n.t('decimalPlacesLabel', { count: decimalPlaces })}</Text>

    <Button title={i18n.t('convertButton')} onPress={convertTemperature} />

    {convertedValue !== '' && (
      <Text style={styles.result}>{i18n.t('resultLabel', { value, fromUnit, convertedValue, toUnit })}</Text>
    )}

    {currentWeather !== null && (
      <Text style={styles.currentWeather}>{i18n.t('currentWeatherLabel', { temperature: currentWeather })}</Text>
    )}

    <Button title={i18n.t('shareButton')} onPress={shareConversion} />

    <Button title={i18n.t('savePresetButton')} onPress={savePreset} />

    <Text style={styles.presetsTitle}>{i18n.t('presetsTitle')}</Text>
    {presets.map(preset => (
      <Text key={preset.name} style={styles.presetText}>{preset.name}: {preset.fromUnit} to {preset.toUnit}</Text>
    ))}

    <Text style={styles.historyTitle}>{i18n.t('historyTitle')}</Text>
    {history.map((item, index) => (
      <Text key={index} style={styles.historyText}>
        {i18n.t('historyItem', { index: index + 1, value: item.value, fromUnit: item.fromUnit, convertedValue: item.converted, toUnit: item.toUnit })}
      </Text>
    ))}
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
 input: {
    width: 200,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  invalidInput: {
    borderColor: 'red', // Change border color to red for invalid input
  },
 title: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 20,
 },
 input: {
  width: 200,
  height: 40,
  borderColor: 'gray',
  borderWidth: 1,
  padding: 10,
  marginBottom: 20,
 },
 pickerContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 20,
 },
 picker: {
  width: 100,
 },
 pickerText: {
  width: 50,
 },
 slider: {
  width: 200,
  marginBottom: 10,
 },
 sliderText: {
  fontSize: 16,
 },
 result: {
  marginTop: 20,
  fontSize: 16,
 },
 currentWeather: {
  marginTop: 10,
  fontSize: 16,
 },
 presetsTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginTop: 20,
 },
 presetText: {
  fontSize: 16,
 },
 historyTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginTop: 20,
 },
 historyText: {
  fontSize: 16,
 },
});

export default App;
