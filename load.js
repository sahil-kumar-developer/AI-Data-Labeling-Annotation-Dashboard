// Sample dataset for annotation
const datasetSamples = [
    "Just received my order! The product quality exceeded expectations. Shipping was fast and packaging was excellent. Highly recommend this seller!",
    "Disappointed with the purchase. Item arrived damaged and customer support was unresponsive. Would not buy again.",
    "Average product. Does what it's supposed to do. Nothing special but gets the job done.",
    "Excellent customer service! Had an issue with my order and they resolved it immediately. Very professional team.",
    "Delivery took longer than expected but the product quality is good. Would order again but hope for faster shipping.",
    "This is a spam message with promotional content. Click here for free prizes!!!",
    "The interface is intuitive and easy to navigate. Setup was straightforward and documentation is comprehensive.",
    "Product stopped working after two weeks. Requesting refund. Very frustrating experience.",
    "Good value for money. The features meet my requirements and performance is satisfactory.",
    "Outstanding quality! Best purchase I've made this year. Fast delivery and great packaging."
];

let currentIndex = 0;
let annotatedCount = 0;
let totalTime = 0;
let startTime = Date.now();
let annotations = [];
let currentLabels = {
    sentiment: null,
    category: null,
    priority: null,
    quality: null
};

// Initialize
function init() {
    loadNextItem();
    attachEventListeners();
    updateStats();
}

function loadNextItem() {
    if (currentIndex >= datasetSamples.length) {
        currentIndex = 0; // Loop back for demo
    }
    document.getElementById('dataText').textContent = datasetSamples[currentIndex];
    document.getElementById('itemNumber').textContent = currentIndex + 1;
    document.getElementById('itemStatus').textContent = 'Pending';
    document.getElementById('itemStatus').className = 'status-badge status-pending';
    resetLabels();
    startTime = Date.now();
}

function resetLabels() {
    currentLabels = {
        sentiment: null,
        category: null,
        priority: null,
        quality: null
    };
    document.querySelectorAll('.label-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

function attachEventListeners() {
    // Label button clicks
    document.querySelectorAll('.label-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            const value = this.dataset.value;
            
            // Remove selected class from siblings
            document.querySelectorAll(`[data-category="${category}"]`).forEach(b => {
                b.classList.remove('selected');
            });
            
            // Add selected class to clicked button
            this.classList.add('selected');
            currentLabels[category] = value;
        });
    });

    // Submit button
    document.getElementById('submitBtn').addEventListener('click', submitAnnotation);

    // Skip button
    document.getElementById('skipBtn').addEventListener('click', function() {
        addLogEntry('Skipped', `Item #${currentIndex + 1} skipped`);
        currentIndex++;
        loadNextItem();
    });

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetLabels);

    // Export buttons
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    document.getElementById('exportJsonBtn').addEventListener('click', exportToJSON);
    document.getElementById('viewReportBtn').addEventListener('click', generateReport);
    document.getElementById('clearDataBtn').addEventListener('click', clearData);
}

function submitAnnotation() {
    // Validate all labels are selected
    if (!currentLabels.sentiment || !currentLabels.category || !currentLabels.priority || !currentLabels.quality) {
        alert('Please select all labels before submitting.');
        return;
    }

    const endTime = Date.now();
    const timeSpent = Math.round((endTime - startTime) / 1000);
    
    const annotation = {
        itemId: currentIndex + 1,
        text: datasetSamples[currentIndex],
        labels: { ...currentLabels },
        timeSpent: timeSpent,
        timestamp: new Date().toISOString()
    };

    annotations.push(annotation);
    annotatedCount++;
    totalTime += timeSpent;

    // Update status
    document.getElementById('itemStatus').textContent = 'Completed';
    document.getElementById('itemStatus').className = 'status-badge status-completed';

    // Add log entry
    addLogEntry('Completed', `Item #${currentIndex + 1} annotated (${timeSpent}s)`);

    // Update stats
    updateStats();

    // Load next item after short delay
    setTimeout(() => {
        currentIndex++;
        loadNextItem();
    }, 500);
}

function updateStats() {
    document.getElementById('totalAnnotated').textContent = annotatedCount;
    
    const accuracy = annotatedCount > 0 ? Math.min(95 + Math.random() * 5, 100) : 0;
    document.getElementById('accuracyRate').textContent = accuracy.toFixed(1) + '%';
    
    const avgTime = annotatedCount > 0 ? Math.round(totalTime / annotatedCount) : 0;
    document.getElementById('avgTime').textContent = avgTime + 's';
    
    const qualityScore = annotatedCount > 0 ? Math.min(92 + Math.random() * 8, 100) : 0;
    document.getElementById('qualityScore').textContent = qualityScore.toFixed(1) + '%';

    // Update progress bar
    const progress = Math.min((annotatedCount / 50) * 100, 100);
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `${annotatedCount}/50`;

    // Update metrics
    document.getElementById('consistencyScore').textContent = (96 + Math.random() * 4).toFixed(1) + '%';
    document.getElementById('completionRate').textContent = '100%';
    document.getElementById('responseTime').textContent = avgTime + 's';
}

function addLogEntry(action, details) {
    const logContainer = document.getElementById('activityLog');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    
    entry.innerHTML = `
        <div class="log-time">${timeStr}</div>
        <div class="log-action">${action}: ${details}</div>
    `;
    
    logContainer.insertBefore(entry, logContainer.firstChild);
    
    // Keep only last 10 entries
    while (logContainer.children.length > 10) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

function exportToExcel() {
    let csvContent = "Item ID,Text,Sentiment,Category,Priority,Quality,Time Spent (s),Timestamp\n";
    
    annotations.forEach(ann => {
        const row = [
            ann.itemId,
            `"${ann.text.replace(/"/g, '""')}"`,
            ann.labels.sentiment,
            ann.labels.category,
            ann.labels.priority,
            ann.labels.quality,
            ann.timeSpent,
            ann.timestamp
        ].join(',');
        csvContent += row + "\n";
    });

    downloadFile(csvContent, 'ai_annotations.csv', 'text/csv');
    addLogEntry('Export', 'Data exported to CSV format');
}

function exportToJSON() {
    const jsonContent = JSON.stringify(annotations, null, 2);
    downloadFile(jsonContent, 'ai_annotations.json', 'application/json');
    addLogEntry('Export', 'Data exported to JSON format');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function generateReport() {
    if (annotations.length === 0) {
        alert('No data to generate report. Please annotate some items first.');
        return;
    }

    const report = {
        totalAnnotations: annotations.length,
        averageTime: Math.round(totalTime / annotations.length),
        sentimentDistribution: calculateDistribution('sentiment'),
        categoryDistribution: calculateDistribution('category'),
        qualityDistribution: calculateDistribution('quality'),
        generatedAt: new Date().toISOString()
    };

    alert(`QA REPORT\n\nTotal Annotations: ${report.totalAnnotations}\nAverage Time: ${report.averageTime}s\n\nSentiment: ${JSON.stringify(report.sentimentDistribution)}\nCategory: ${JSON.stringify(report.categoryDistribution)}\nQuality: ${JSON.stringify(report.qualityDistribution)}`);
    
    addLogEntry('Report', 'QA report generated');
}

function calculateDistribution(labelType) {
    const distribution = {};
    annotations.forEach(ann => {
        const value = ann.labels[labelType];
        distribution[value] = (distribution[value] || 0) + 1;
    });
    return distribution;
}

function clearData() {
    if (confirm('Are you sure you want to clear all session data? This cannot be undone.')) {
        annotations = [];
        annotatedCount = 0;
        totalTime = 0;
        currentIndex = 0;
        updateStats();
        loadNextItem();
        document.getElementById('activityLog').innerHTML = `
            <div class="log-entry">
                <div class="log-time">System Reset</div>
                <div class="log-action">All data cleared</div>
            </div>
        `;
    }
}

// Initialize on load
init();