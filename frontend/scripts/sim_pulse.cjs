const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../public/data/live_rates.json');

console.log('💓 Agni Heartbeat Simulator v1.0 Active');
console.log('Targeting:', DATA_FILE);

function pulse() {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

        // Randomize Market Rate slightly (+/- 0.05)
        const volatility = (Math.random() * 0.10) - 0.05;
        const newRate = (parseFloat(data.market_rate) + volatility).toFixed(2);

        // Update Trend
        data.trend = newRate > data.market_rate ? 'UP' : 'DOWN';
        data.market_rate = parseFloat(newRate);
        data.last_updated = new Date().toISOString();

        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

        const changeSymbol = volatility >= 0 ? '📈' : '📉';
        console.log(`[${new Date().toLocaleTimeString()}] Pulse: ₹${newRate} ${changeSymbol}`);

    } catch (err) {
        console.error('Heartbeat skipped:', err.message);
    }
}

// Beat every 3 seconds (faster than real life for demo purposes)
setInterval(pulse, 3000);
pulse(); // Initial beat
