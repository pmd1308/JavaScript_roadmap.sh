

export const saveData = async (key, data ) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error("AsyncStorage save: ", e.message);
        throw e;
    }
};

export const loadData = async (key) => {
    try {
        const data = await AsyncStorage.getItem(key);
        return JSON.parse(data);
    } catch (e) {
        console.error("AsyncStorage load: ", e.message);
        throw e;
    }
};

