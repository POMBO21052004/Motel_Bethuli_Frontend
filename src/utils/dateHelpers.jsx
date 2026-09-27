export const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) {
        return "Bonjour";
    } else if (hour >= 12 && hour < 14) {
        return "Bonne après-midi";
    } else {
        return "Bonsoir";
    }
};
