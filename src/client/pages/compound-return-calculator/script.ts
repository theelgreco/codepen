import Chart from "chart.js/auto";

const form = document.getElementById("form") as HTMLFormElement;
const resultsElement = document.getElementById("results") as HTMLDivElement;
const ctx = document.getElementById("myChart") as HTMLCanvasElement;

/**
 * This is for calculating it when the investment contributions are made on a yearly basis, e.g investing £24000 per year.
 */
function calculateCompoundInterestYearlyBasis(
    startingBalance: number,
    amountToInvestPerYear: number,
    interestAsPercent: number,
    yearsToCalculate: number
) {
    const interestAsDecimal = interestAsPercent / 100; // convert percent to decimal -> 10 becomes 0.1

    let total = startingBalance;

    const results: { year: number; amount: number; withoutInterest: number }[] = [];

    for (let i = 0; i <= yearsToCalculate; i++) {
        total += amountToInvestPerYear;
        total += total * interestAsDecimal;

        if (i > 0) {
            results.push({
                year: i,
                amount: Math.floor(total),
                withoutInterest: Math.floor(startingBalance + i * amountToInvestPerYear),
            });
        }
    }

    return results;
}

/**
 * This is for calculating it when the investment contributions are made on a monthly basis, e.g investing £2000 per ymonth.
 */
function calculateCompoundInterestMonthlyBasis(
    startingBalance: number,
    amountToInvestPerYear: number,
    interestAsPercent: number,
    yearsToCalculate: number
) {
    const interestAsDecimal = interestAsPercent / 100; // convert percent to decimal -> 10 becomes 0.1
    const interestPerMonth = interestAsDecimal / 12; // calculate the monthly interest
    const amountPerMonth = amountToInvestPerYear / 12; // calculate the monthly investment
    const monthsToCalculate = yearsToCalculate * 12; // caluclate how many months we are investing for

    let total = startingBalance;

    const results: { year: number; amount: number; withoutInterest: number }[] = [];

    for (let i = 0; i <= monthsToCalculate; i++) {
        total += amountPerMonth;
        total *= 1 + interestPerMonth;

        if (i !== 0 && i % 12 === 0) {
            results.push({
                year: i / 12,
                amount: Math.floor(total),
                withoutInterest: Math.floor(startingBalance + (i / 12) * amountToInvestPerYear),
            });
        }
    }

    return results;
}

function getFormattedCurrencyString(value: number | bigint, code: string) {
    const formatOptions: Intl.NumberFormatOptions = { style: "currency", currencyDisplay: "narrowSymbol", currency: code };
    return new Intl.NumberFormat("en-GB", formatOptions).format(value);
}

let chart: Chart | null = null;

function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    resultsElement.innerHTML = "";

    const startingBalance = (form[0] as HTMLInputElement).valueAsNumber;
    const yearlyInvestment = (form[1] as HTMLInputElement).valueAsNumber;
    const yearlyInterest = (form[2] as HTMLInputElement).valueAsNumber;
    const yearsToCalculate = (form[3] as HTMLInputElement).valueAsNumber;

    const result = calculateCompoundInterestMonthlyBasis(startingBalance, yearlyInvestment, yearlyInterest, yearsToCalculate);

    let str = "";

    result.forEach((res) => (str += `year: ${res.year}, amount: ${getFormattedCurrencyString(res.amount, "GBP")}\n`));

    const labels = result.map((res) => `Year ${res.year}`);
    const values = result.map((res) => res.amount);
    const withoutInterest = result.map((res) => res.withoutInterest);

    const data = {
        labels,
        datasets: [
            {
                label: "With Interest",
                data: values,
                fill: true,
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 1,
            },
            {
                label: "Without Interest",
                data: withoutInterest,
                fill: true,
                borderColor: "rgb(255, 0, 0)",
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                tension: 1,
            },
        ],
    };

    // resultsElement.innerText = str;

    if (chart === null) {
        chart = new Chart(ctx, {
            type: "line",
            data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    } else {
        chart.clear();
        chart.data = data;
        chart.update();
    }
}

form.addEventListener("submit", handleSubmit);
