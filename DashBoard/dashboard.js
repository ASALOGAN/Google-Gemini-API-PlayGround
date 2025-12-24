let costChart;
let tokenChart;

/* --------------------------------------------
   Load JSONL usage data
-------------------------------------------- */
const loadUsageData = async () => {
  const res = await fetch("../usage/usage-log.jsonl");
  const text = await res.text();

  return text
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
};

/* --------------------------------------------
   Utils
-------------------------------------------- */
const formatUSD = (v) => `$${v.toFixed(4)}`;

const aggregateDailyCost = (data) =>
  data.reduce((acc, row) => {
    const day = row.timestamp.split("T")[0];
    acc[day] = (acc[day] || 0) + row.cost.totalUSD;
    return acc;
  }, {});

/* --------------------------------------------
   Charts
-------------------------------------------- */
const renderCostChart = (labels, values) => {
  if (costChart) costChart.destroy();

  costChart = new Chart(document.getElementById("costChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Cost (USD)",
          data: values,
          borderColor: "#818cf8",
          backgroundColor: "rgba(129,140,248,0.25)",
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#c7d2fe",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#e5e7eb",
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => formatUSD(ctx.parsed.y),
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#9ca3af" },
          title: {
            display: true,
            text: "Date / Call",
            color: "#9ca3af",
          },
        },
        y: {
          ticks: { color: "#9ca3af" },
          title: {
            display: true,
            text: "Cost (USD)",
            color: "#9ca3af",
          },
        },
      },
    },
  });
};

const renderTokenChart = (thinking, visible) => {
  if (tokenChart) tokenChart.destroy();

  tokenChart = new Chart(document.getElementById("tokenChart"), {
    type: "doughnut",
    data: {
      labels: ["Thinking Tokens", "Visible Output Tokens"],
      datasets: [
        {
          data: [thinking, visible],
          backgroundColor: ["#fb923c", "#22c55e"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#e5e7eb",
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed}`,
          },
        },
      },
    },
  });
};

/* --------------------------------------------
   Init dashboard
-------------------------------------------- */
const initDashboard = (data) => {
  let totals = {
    cost: 0,
    tokens: 0,
    thinking: 0,
    visible: 0,
  };

  data.forEach((r) => {
    totals.cost += r.cost.totalUSD;
    totals.tokens += r.tokens.total;
    totals.thinking += r.tokens.thinking;
    totals.visible += r.tokens.visibleOutput;
  });

  document.getElementById("totalCost").innerText = formatUSD(totals.cost);
  document.getElementById("totalTokens").innerText = totals.tokens;
  document.getElementById("thinkingTokens").innerText = totals.thinking;
  document.getElementById("visibleTokens").innerText = totals.visible;

  // Default: daily aggregated view
  const daily = aggregateDailyCost(data);
  renderCostChart(Object.keys(daily), Object.values(daily));
  renderTokenChart(totals.thinking, totals.visible);

  setupSelectors(data);
};

/* --------------------------------------------
   View selectors
-------------------------------------------- */
const setupSelectors = (data) => {
  const viewSelector = document.getElementById("viewSelector");
  const dateFilter = document.getElementById("dateFilter");
  const dateSelector = document.getElementById("dateSelector");

  const dates = [...new Set(data.map((r) => r.timestamp.split("T")[0]))];

  dates.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    dateSelector.appendChild(opt);
  });

  viewSelector.onchange = () => {
    if (viewSelector.value === "perCall") {
      dateFilter.classList.remove("hidden");
      renderPerCall(data, dateSelector.value);
    } else {
      dateFilter.classList.add("hidden");
      const daily = aggregateDailyCost(data);
      renderCostChart(Object.keys(daily), Object.values(daily));
    }
  };

  dateSelector.onchange = () => renderPerCall(data, dateSelector.value);
};

const renderPerCall = (data, date) => {
  const filtered = data.filter((r) => r.timestamp.startsWith(date));

  renderCostChart(
    filtered.map((_, i) => `Call ${i + 1}`),
    filtered.map((r) => r.cost.totalUSD)
  );
};

/* --------------------------------------------
   Boot
-------------------------------------------- */
loadUsageData().then(initDashboard);
