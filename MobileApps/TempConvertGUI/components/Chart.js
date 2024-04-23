

export const Chart = ({ temperatureUnits, conversionFactors }) => {
    return (
        <View>
            <BarChart
                data={{
                    labels: temperatureUnits,
                    datasets: [
                        {
                            data: conversionFactors,
                        },
                    ],
                }}
                width={400}
                height={220}
                chartConfig={{
                    backgroundColor: '#e26a00',
                    backgroundGradientFrom: '#fb8c00',
                    backgroundGradientTo: '#ffa726',
                    decimalPlaces: 2,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                    propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                        stroke: '#ffa726',
                    },
                }}
            />
        </View>
    );
};

