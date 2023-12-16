const serverHost = process.env.VUE_APP_SERVER_HOST;

const getStratsFromDB = async () => {
    try {
        const response = await fetch(`${serverHost}/get/strat`);
        const data = await response.json();
        return data
    } catch (err) {
        console.error(err);
    }
}

export { getStratsFromDB };