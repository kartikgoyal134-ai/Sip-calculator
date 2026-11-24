const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function formatMoney(amount) {
  return moneyFormatter.format(Math.max(0, amount));
}

function getNumber(id) {
  return Number(document.getElementById(id).value);
}

/*
  SIP estimate assumes:
  - Monthly contributions
  - Monthly compounding based on annual return / 12
  - Contributions made at the beginning of each month
*/
function calculateSip(monthlyAmount, annualRate, years) {
  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  let futureValue = 0;

  if (monthlyRate === 0) {
    futureValue = monthlyAmount * months;
  } else {
    futureValue =
      monthlyAmount *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate);
  }

  const invested = monthlyAmount * months;

  return {
    futureValue,
    invested,
    returns: Math.max(0, futureValue - invested),
    months
  };
}

function updateSipCalculator() {
  const monthlyAmount = getNumber("monthlyInvestment");
  const annualRate = getNumber("annualReturn");
  const years = getNumber("investmentYears");

  if (
    monthlyAmount <= 0 ||
    annualRate < 0 ||
    years <= 0 ||
    !Number.isFinite(monthlyAmount + annualRate + years)
  ) {
    return;
  }

  const result = calculateSip(monthlyAmount, annualRate, years);

  document.getElementById("futureValue").textContent = formatMoney(result.futureValue);
  document.getElementById("totalInvested").textContent = formatMoney(result.invested);
  document.getElementById("estimatedReturns").textContent = formatMoney(result.returns);

  const total = result.invested + result.returns;
  const investedPercent = total > 0 ? (result.invested / total) * 100 : 0;
  const returnsPercent = total > 0 ? (result.returns / total) * 100 : 0;

  document.getElementById("investedBar").style.width = `${investedPercent}%`;
  document.getElementById("returnsBar").style.width = `${returnsPercent}%`;

  const tableBody = document.getElementById("yearlyTable");
  tableBody.innerHTML = "";

  for (let year = 1; year <= years; year++) {
    const yearResult = calculateSip(monthlyAmount, annualRate, year);
    const row = document.createElement("tr");

    const yearCell = document.createElement("td");
    yearCell.textContent = `Year ${year}`;

    const investedCell = document.createElement("td");
    investedCell.textContent = formatMoney(yearResult.invested);

    const valueCell = document.createElement("td");
    valueCell.textContent = formatMoney(yearResult.futureValue);

    row.append(yearCell, investedCell, valueCell);
    tableBody.appendChild(row);
  }
}

function updateGoalPlanner() {
  const target = getNumber("goalAmount");
  const years = getNumber("goalYears");
  const annualRate = getNumber("goalReturn");

  if (
    target <= 0 ||
    years <= 0 ||
    annualRate < 0 ||
    !Number.isFinite(target + years + annualRate)
  ) {
    return;
  }

  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  let requiredMonthly;

  if (monthlyRate === 0) {
    requiredMonthly = target / months;
  } else {
    requiredMonthly =
      target /
      (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
        (1 + monthlyRate));
  }

  document.getElementById("requiredSip").textContent = formatMoney(requiredMonthly);
  document.getElementById("goalSummary").textContent =
    `To reach ${formatMoney(target)} in ${years} year(s), the estimated monthly investment is ${formatMoney(requiredMonthly)}.`;
}

function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  const pages = document.querySelectorAll(".page");

  function showPage() {
    const requestedId = window.location.hash.slice(1);
    const validPage = document.getElementById(requestedId);
    const pageId = validPage && validPage.classList.contains("page")
      ? requestedId
      : "home";

    pages.forEach((page) => {
      page.classList.toggle("active", page.id === pageId);
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${pageId}`);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href").slice(1);
      pages.forEach((page) => {
        page.classList.toggle("active", page.id === targetId);
      });
      navLinks.forEach((navLink) => {
        navLink.classList.toggle("active", navLink === link);
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  window.addEventListener("hashchange", showPage);
  showPage();
}

function setupThemeToggle() {
  const toggle = document.getElementById("themeToggle");

  toggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    toggle.textContent = isDark ? "☀" : "☾";
    toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  });
}

document.getElementById("sipForm").addEventListener("submit", (event) => {
  event.preventDefault();
  updateSipCalculator();
});

document.getElementById("goalForm").addEventListener("submit", (event) => {
  event.preventDefault();
  updateGoalPlanner();
});

["monthlyInvestment", "annualReturn", "investmentYears"].forEach((id) => {
  document.getElementById(id).addEventListener("input", updateSipCalculator);
});

["goalAmount", "goalYears", "goalReturn"].forEach((id) => {
  document.getElementById(id).addEventListener("input", updateGoalPlanner);
});

document.getElementById("currentYear").textContent = new Date().getFullYear();

setupNavigation();
setupThemeToggle();
updateSipCalculator();
updateGoalPlanner();
