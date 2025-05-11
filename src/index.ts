const app = document.querySelector('.app');

type ExchangeRates = {
    [key: string]: number;
};

type TableData = {
    [key: string]: string;
};

type ExchangeRateResponse = {
    base?: string;
    rates: ExchangeRates;
};

const memoExchangeRate: string[] = [];

const currencies: string[] = ['USD', 'CNY', 'RUB', 'RSD'];

function createTable() {
    const table = document.createElement('table');
    table.classList.add('table');

    for (let i = 0; i < currencies.length; i++) {
        const row = document.createElement('tr');
        row.classList.add('row');
        table.appendChild(row);

        for (let j = 0; j < 2; j++) {
            const cell = document.createElement('td');
            row.appendChild(cell);
            j ? cell.classList.add('rate') : cell.classList.add('currency');
            cell.textContent = 'fetching..';
        }
    }

    if (app) {
        app.appendChild(table);
    }
}

function getCurrencyName() {
    return fetch(`https://api.exchangeratesapi.io/v1/symbols?access_key=${API_KEY}`)
        .then((response) => response.json());
}

function fillTheTable() {
    getCurrencyName()
        .then(({ symbols }) => {
            const tableData: TableData = {};

            for (const symbol of currencies) {
                tableData[symbol] = symbols[symbol];
            }

            renewDataTable('currency', tableData);

            setTimeout(() => {
                getCurrencyRates()
                    .then(({ base, rates }: ExchangeRateResponse) => {
                        const appHeader = document.querySelector('.app-header');

                        if (appHeader) {
                            appHeader.textContent += `${base} exchange rate`;
                        }

                        renewDataTable('rate', rates);
                    });
            }, 1000);
        });
}

function getCurrencyRates() {
    return fetch(`https://api.exchangeratesapi.io/v1/latest?access_key=${API_KEY}&symbols=${currencies.toString()}`)
        .then((response) => response.json());
}

function renewDataTable(selector: string, data: ExchangeRates | TableData) {
    const dataContainers = document.querySelectorAll(`.${selector}`);

    if (dataContainers) {
        let row = 0;

        dataContainers.forEach((dataContainer) => {
            memoExchangeRate[row] = data[currencies[row]].toString();
            dataContainer.textContent = memoExchangeRate[row];
            row = row + 1;
        });
    }
}

const tableDataRenewInterval = setInterval(() => {
    getCurrencyRates()
        .then(({ rates }: ExchangeRateResponse) => {
            const rateValues = Object.values(rates);
            const compareResult = compareData(memoExchangeRate, rateValues);
            
            if (!compareResult) {
                renewDataTable('rate', rates);
            }
        });
}, 60000);

function compareData(oldData: string[], newData: number[]) {
    if (oldData.length === newData.length) {
        
        for (let i = 0; i < oldData.length; i++) {
            if (newData[i].toString() !== oldData[i]) {
                return false;
            }
        }
        return true;
    }

    return false;
}

createTable();
fillTheTable();
