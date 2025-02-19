export const memoizedOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'none' // Hide legend
        }
    },
    scales: {
        x: {
            beginAtZero: true,
            grid: {
                display: false // Hide gridlines
            },
            ticks: {
                autoSkip: true
            },
            categoryPercentage: 1.0,
            barPercentage: 0.8
        },
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 25,
                max: 100,
                min: 0
            }
        }
    }
};

export const memoizedBarOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'bottom'
        },
        labels: {
            boxWidth: 20,
            boxHeight: 20,
            padding: 10
        }
    },
    scales: {
        x: {
            beginAtZero: true,
            grid: {
                display: false
            },
            ticks: {
                autoSkip: true
            },
            categoryPercentage: 1.0,
            barPercentage: 0.8
        },
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 25,
                max: 100,
                min: 0
            }
        }
    }
};
