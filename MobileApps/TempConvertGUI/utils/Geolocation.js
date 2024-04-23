

export const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        Geolocation.getCurrentPosition(
            position => {
                setLocation(position);
            },
            error => {
                setError(error);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );
    }, []);

    return { location, error };
}