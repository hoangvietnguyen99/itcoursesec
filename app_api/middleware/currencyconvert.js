const axios = require('axios');

// https://fixer.io/
// const FIXER_API_KEY = process.env.FIXER_API_KEY;
const FIXER_API_KEY = process.env.FIXER_API_KEY;
const FIXER_API = `http://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}`;

// https://restcountry.eu
const REST_COUNTRIES_API = `https://restcountries.eu/rest/v2/currency`;

// Fetch data about currencies
const getExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    const { data: { rates } } = await axios.get(FIXER_API);

    const euro = 1 / rates[fromCurrency];
    const exchangeRate = euro * rates[toCurrency];

    return exchangeRate;
  } catch (error) {
    throw new Error(`Unable to get currency ${fromCurrency} and ${toCurrency}`)
  }
}

const getCountries = async (currencyCode) => {
  try {
    const { data } = await axios.get(`${REST_COUNTRIES_API}/${currencyCode}`);

    return data.map(({ name }) => name);
  } catch (error) {
    throw new Error(`Unable to get countries that use ${currencyCode}`);
  }
}

getCountries('AUD');

const convertCurrency = async (fromCurrency, toCurrency, amount) => {
  fromCurrency = fromCurrency.toUpperCase();
  toCurrency = toCurrency.toUpperCase();

  const [exchangeRate, countries] = await Promise.all([
    getExchangeRate(fromCurrency, toCurrency),
    getCountries(toCurrency)
  ]);

  const convertedAmount = (amount * exchangeRate).toFixed(2);

  return (
    `${amount} ${fromCurrency} is worth ${convertedAmount} ${toCurrency}.
    You can spend these in the following countries: ${countries}`
  );
}

const convertCurrencyAPI = async (req, res) => {
  let {fromCurrency, toCurrency, amount} = req.body;
  fromCurrency = fromCurrency.toUpperCase();
  toCurrency = toCurrency.toUpperCase();
  amount = parseFloat(amount);

  const [exchangeRate, countries] = await Promise.all([
    getExchangeRate(fromCurrency, toCurrency),
    getCountries(toCurrency)
  ]);

  const convertedAmount = (amount * exchangeRate).toFixed(2);

  res.status(200).json(convertedAmount);
}

module.exports = {
  convertCurrency,
  convertCurrencyAPI
}
// convertCurrency('VND', 'USD', 100000)
//   .then(result => console.log(result))
//   .catch(error => console.log(error));