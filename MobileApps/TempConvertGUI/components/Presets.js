

export const Presets = ({ presets }) => {
    const renderItem = ({ item }) => (
      <View style={styles.item}>
            <Text style={styles.presetText}>{`
                ${item.name}: 
                ${item.fromUnit} to 
                ${item.toUnit}`}
            </Text>
      </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{i18n.t('presetsTitle')}</Text>
            <FlashList
                data={presets}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
            />
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
    presetsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 20,
    },
    item: {
      backgroundColor: '#f9c2ff',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    presetText: {
      fontSize: 16,
    },
  });
  
