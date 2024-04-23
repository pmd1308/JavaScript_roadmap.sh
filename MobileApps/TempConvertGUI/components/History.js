

export const History = ({ history }) => {
    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.historyText}>
                {`${item.value} 
                ${item.fromUnit} = 
                ${item.converted} 
                ${item.toUnit}`}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{i18n.t('historyTitle')}</Text>
            <FlashList
                data={history}
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
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    item: {
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    historyText: {
        fontSize: 18,
    },
});

