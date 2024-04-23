

export const ConversionForm =({
    value,
    fromUnit,
  toUnit,
  convertedValue,
  decimalPlaces,
  temperatureUnits,
  handleInputChange,
  handleFromUnitChange,
  handleToUnitChange,
  handleDecimalChange,
  convertTemperature,
  shareConversion,
  savePreset,
}) => {
    return (
        <View>
      <Text>{i18n.t('inputTextLabel')}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleInputChange}
        placeholder={i18n.t('inputPlaceholder')}
        keyboardType="numeric"
      />
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerText}>{i18n.t('fromUnitLabel')}</Text>
        <Picker
          style={styles.picker}
          selectedValue={fromUnit}
          onValueChange={handleFromUnitChange}
        >
          {temperatureUnits.map((unit, index) => (
            <Picker.Item key={index} label={unit} value={unit} />
          ))}
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerText}>{i18n.t('toUnitLabel')}</Text>
        <Picker
          style={styles.picker}
          selectedValue={toUnit}
          onValueChange={handleToUnitChange}
        >
          {temperatureUnits.map((unit, index) => (
            <Picker.Item key={index} label={unit} value={unit} />
          ))}
        </Picker>
      </View>
      <Text>{i18n.t('decimalLabel')}</Text>
      <Slider
        style={styles.slider}
        value={decimalPlaces}
        minimumValue={0}
        maximumValue={4}
        step={1}
        onValueChange={handleDecimalChange}
      />
      <Text style={styles.sliderText}>{i18n.t('decimalValueLabel', { decimalPlaces })}</Text>
      <Button title={i18n.t('convertButtonLabel')} onPress={convertTemperature} />
      <Button title={i18n.t('shareButtonLabel')} onPress={shareConversion} />
      <Button title={i18n.t('savePresetButtonLabel')} onPress={savePreset} />
    </View>
  );
};

const styles = StyleSheet.create({
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
});

