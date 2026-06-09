let currentUser;
let savingsChartInstance = null;

window.onload = () => {
    Auth.onReady(user => {
        if(!user) {
            window.location.href = 'auth.html';
            return;
        }
        if(!user.hasBaseline) {
            window.location.href = 'onboarding.html';
            return;
        }
        currentUser = user;
        
        const displayName = currentUser.name || currentUser.displayName || currentUser.fullName || (currentUser.email ? currentUser.email.split('@')[0] : 'User');
        document.getElementById('user-greeting').innerText = `Hello, ${displayName}!`;
        
        // Custom action select toggle
        document.getElementById('action-select').addEventListener('change', function(e) {
            if(e.target.value === 'custom') {
                document.getElementById('custom-action-group').classList.remove('hidden');
                document.getElementById('custom-kg').required = true;
            } else {
                document.getElementById('custom-action-group').classList.add('hidden');
                document.getElementById('custom-kg').required = false;
            }
        });

        updateUI();
    });
};

function updateUI() {
    // Animate Numbers
    animateValue("val-baseline", 0, Math.round(currentUser.baselineFootprint), 1000);
    animateValue("val-saved", 0, Math.round(currentUser.savedTotal), 1000);
    animateValue("val-current", 0, Math.round(currentUser.currentFootprint), 1000);

    document.getElementById('user-points').innerText = currentUser.points;

    renderActivityLog();
    renderBadges();
    renderChart();
}

async function logSavingsAction(e) {
    e.preventDefault();
    const select = document.getElementById('action-select');
    let actionName = select.options[select.selectedIndex].text.split('(')[0].trim();
    let kgSaved = 0;

    if(select.value === 'custom') {
        actionName = "Custom Action";
        kgSaved = parseFloat(document.getElementById('custom-kg').value);
    } else {
        kgSaved = parseFloat(select.options[select.selectedIndex].dataset.kg);
    }

    if(isNaN(kgSaved) || kgSaved <= 0) return;

    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = 'Saving...';

    // Update user state
    currentUser.savedTotal += kgSaved;
    currentUser.currentFootprint = currentUser.baselineFootprint - currentUser.savedTotal;
    currentUser.points += Math.round(kgSaved * 10); // 10 pts per kg saved
    
    const record = {
        date: new Date().toLocaleDateString(),
        action: actionName,
        kg: kgSaved
    };
    currentUser.history.unshift(record); // add to top

    try {
        await Auth.updateCurrentUser({
            savedTotal: currentUser.savedTotal,
            currentFootprint: currentUser.currentFootprint,
            points: currentUser.points,
            history: currentUser.history
        });
        
        showToast(`Logged! You saved ${kgSaved} kg of CO2 and earned ${Math.round(kgSaved * 10)} points!`);
        
        // Reset form
        e.target.reset();
        document.getElementById('custom-action-group').classList.add('hidden');
        
        updateUI();
    } catch (err) {
        showToast("Error connecting to database. Please try again.", "error");
    } finally {
        btn.innerText = originalText;
    }
}

function renderActivityLog() {
    const logContainer = document.getElementById('activity-log');
    logContainer.innerHTML = '';
    
    if(currentUser.history.length === 0) {
        logContainer.innerHTML = '<div style="font-size: 14px; opacity: 0.5; padding: 10px 0;">No actions logged yet. Start saving today!</div>';
        return;
    }

    currentUser.history.slice(0, 10).forEach(item => {
        const div = document.createElement('div');
        div.style.background = 'rgba(255,255,255,0.02)';
        div.style.border = '1px solid rgba(255,255,255,0.05)';
        div.style.padding = '14px 16px';
        div.style.borderRadius = '12px';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.innerHTML = `
            <div>
                <div style="font-size: 14px; font-weight: 500; color: var(--text-main); margin-bottom: 2px;">${item.action}</div>
                <div style="font-size: 12px; color: var(--text-muted);">${item.date}</div>
            </div>
            <div style="color: var(--primary); font-weight: 700; font-size: 15px;">-${item.kg} kg</div>
        `;
        logContainer.appendChild(div);
    });
}

function renderBadges() {
    const points = currentUser.points;
    const saved = currentUser.savedTotal;

    if(currentUser.history.length > 0) document.getElementById('badge-1').classList.add('unlocked');
    if(saved >= 20) document.getElementById('badge-2').classList.add('unlocked');
    if(saved >= 50) document.getElementById('badge-3').classList.add('unlocked');
    if(saved >= 100) document.getElementById('badge-4').classList.add('unlocked');
}

function renderChart() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter';

    const ctx = document.getElementById('savingsChart').getContext('2d');
    if(savingsChartInstance) savingsChartInstance.destroy();
    
    let chartData = [];
    let labels = [];
    
    if(currentUser.history.length === 0) {
        labels = ['Today'];
        chartData = [0];
    } else {
        let cumulative = 0;
        const revHistory = [...currentUser.history].reverse();
        
        revHistory.forEach((item, index) => {
            cumulative += item.kg;
            labels.push(`Action ${index+1}`);
            chartData.push(cumulative);
        });
    }

    savingsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative Carbon Saved (kg)',
                data: chartData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#10b981',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// AI Functions
async function analyzeFootprint() {
    const btn = document.getElementById('btn-analyze');
    const loader = document.getElementById('loader-analyze');
    const resultDiv = document.getElementById('result-analyze');
    
    btn.classList.add('hidden');
    loader.style.display = 'block';
    resultDiv.classList.add('hidden');

    const prompt = `Act as an expert environmental scientist.
    Analyze this user's data:
    - Baseline Footprint: ${currentUser.baselineFootprint.toFixed(2)} kg/yr
    - Total Carbon Saved: ${currentUser.savedTotal.toFixed(2)} kg
    - Current Projected Footprint: ${currentUser.currentFootprint.toFixed(2)} kg/yr
    
    Breakdown (Annualized Baseline):
    Transport: ${currentUser.emissionsBreakdown.transport}kg
    Electricity: ${currentUser.emissionsBreakdown.electricity}kg
    Flights: ${currentUser.emissionsBreakdown.flight}kg
    Lifestyle: ${currentUser.emissionsBreakdown.lifestyle}kg
    
    Provide a concise, encouraging 3-point analysis on their progress and biggest remaining area for improvement. Format nicely without bold markdown (**).`;

    const response = await fetchGemini(prompt);
    
    loader.style.display = 'none';
    resultDiv.innerText = response.replace(/\*/g, ''); 
    resultDiv.classList.remove('hidden');
    btn.classList.remove('hidden');
    btn.innerText = "Re-Analyze";
}

// Chatbot
function toggleChat() {
    document.getElementById('chatbot-window').classList.toggle('active');
}

async function sendChat() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if(!text) return;
    
    appendMsg('user', text);
    input.value = '';
    
    const sys = "You are EcoBot, an encouraging AI sustainability assistant. Give very short, concise tips (1-2 sentences) about saving carbon.";
    const prompt = `User total saved: ${currentUser.savedTotal}kg. User says: ${text}`;

    const typingId = 'typing-' + Date.now();
    appendMsg('bot', '...', typingId);

    const response = await fetchGemini(prompt, sys);
    
    const typingNode = document.getElementById(typingId);
    if(typingNode) {
        typingNode.innerText = response.replace(/\*/g, '');
    }
}

function appendMsg(sender, text, id="") {
    const chatBox = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    if(id) div.id = id;
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Utils
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start) + ' <span style="font-size: 16px; font-weight: 600; color: var(--text-muted);">kg</span>';
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
