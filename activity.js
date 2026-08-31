const activityReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatCounterValue(value, element) {
  const format = element.dataset.counterFormat || "integer";
  const prefix = element.dataset.counterPrefix || "";
  const suffix = element.dataset.counterSuffix || "";
  const decimals = Number(element.dataset.counterDecimals || 0);

  let formatted;
  if (format === "compact") {
    const units = [
      [1_000_000_000, "B"],
      [1_000_000, "M"],
      [1_000, "K"]
    ];
    const unit = units.find(([threshold]) => Math.abs(value) >= threshold);
    if (unit) {
      const scaled = value / unit[0];
      const compactDecimals = Number.isInteger(scaled) ? 0 : Math.min(decimals || 1, 1);
      formatted = `${scaled.toFixed(compactDecimals)}${unit[1]}`;
    } else {
      formatted = Math.round(value).toLocaleString("en-US");
    }
  } else if (format === "decimal") {
    formatted = value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  } else {
    formatted = Math.round(value).toLocaleString("en-US");
  }

  return `${prefix}${formatted}${suffix}`;
}

function setCounterValue(element, value) {
  element.textContent = formatCounterValue(value, element);
}

function animateCounter(element) {
  if (element.dataset.counterAnimated === "true") return;
  element.dataset.counterAnimated = "true";

  const target = Number(element.dataset.counterValue);
  if (!Number.isFinite(target)) return;

  const accessibleLabel = element.dataset.counterLabel;
  if (accessibleLabel) element.setAttribute("aria-label", accessibleLabel);

  if (activityReducedMotion) {
    setCounterValue(element, target);
    return;
  }

  setCounterValue(element, 0);
  const duration = Math.min(2000, Math.max(900, Number(element.dataset.counterDuration || 1500)));
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    setCounterValue(element, target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const counterObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    )
  : null;

function initCounters(scope = document) {
  scope.querySelectorAll("[data-counter-value]").forEach((element) => {
    if (counterObserver) counterObserver.observe(element);
    else animateCounter(element);
  });
}

function formatActivityDate(value, includeTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Update pending";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {})
  }).format(date);
}

function getBuildDayCount(startedAt) {
  const start = new Date(`${startedAt}T00:00:00`);
  if (Number.isNaN(start.getTime())) return 0;
  return Math.max(1, Math.floor((Date.now() - start.getTime()) / 86_400_000) + 1);
}

function updateActivitySurface(surface, data) {
  const tokenTotal = Number(data.tokens?.total || 0);
  const buildDays = getBuildDayCount(data.growthAI?.startedAt);
  const reviewStates = Number(data.growthAI?.reviewStates || 0);
  const latest = data.growthAI?.latestUpdate;

  surface.querySelectorAll('[data-activity-metric="tokens"]').forEach((element) => {
    element.dataset.counterValue = String(tokenTotal);
    element.dataset.counterLabel = `${data.tokens?.approximate ? "Approximately " : ""}${tokenTotal.toLocaleString("en-US")} AI tokens`;
    element.dataset.counterAnimated = "false";
  });
  surface.querySelectorAll('[data-activity-metric="build-days"]').forEach((element) => {
    element.dataset.counterValue = String(buildDays);
    element.dataset.counterLabel = `${buildDays} days building Growth AI Agent`;
    element.dataset.counterAnimated = "false";
  });
  surface.querySelectorAll('[data-activity-metric="review-states"]').forEach((element) => {
    element.dataset.counterValue = String(reviewStates);
    element.dataset.counterLabel = `${reviewStates} review states`;
    element.dataset.counterAnimated = "false";
  });

  surface.querySelectorAll("[data-activity-generated]").forEach((element) => {
    element.textContent = `Snapshot refreshed ${formatActivityDate(data.generatedAt, true)}`;
    element.setAttribute("datetime", data.generatedAt);
  });
  surface.querySelectorAll("[data-activity-token-note]").forEach((element) => {
    element.textContent = `${data.tokens?.sourceLabel || "Working estimate"} · updated ${formatActivityDate(data.tokens?.updatedAt)}`;
  });
  surface.querySelectorAll("[data-activity-status]").forEach((element) => {
    element.textContent = data.growthAI?.status || "In development";
  });

  if (latest) {
    surface.querySelectorAll("[data-activity-latest-title]").forEach((element) => {
      element.textContent = latest.title;
      element.href = latest.url || data.growthAI.repositoryUrl;
    });
    surface.querySelectorAll("[data-activity-latest-date]").forEach((element) => {
      element.textContent = formatActivityDate(latest.timestamp);
      element.setAttribute("datetime", latest.timestamp);
    });
  }

  const updates = Array.isArray(data.growthAI?.recentUpdates) ? data.growthAI.recentUpdates : [];
  surface.querySelectorAll("[data-activity-updates]").forEach((list) => {
    list.replaceChildren(
      ...updates.slice(0, 3).map((update) => {
        const item = document.createElement("li");
        const time = document.createElement("time");
        const link = document.createElement("a");
        time.dateTime = update.timestamp;
        time.textContent = formatActivityDate(update.timestamp);
        link.href = update.url || data.growthAI.repositoryUrl;
        link.textContent = update.title;
        item.append(time, link);
        return item;
      })
    );
  });

  surface.dataset.activityLoaded = "true";
  initCounters(surface);
}

async function loadActivityData() {
  const surfaces = document.querySelectorAll("[data-ai-activity]");
  if (!surfaces.length) return;

  try {
    const dailyCacheKey = new Date().toISOString().slice(0, 10);
    const response = await fetch(`./data/ai-activity.json?v=${dailyCacheKey}`, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Activity data returned ${response.status}`);
    const data = await response.json();
    surfaces.forEach((surface) => updateActivitySurface(surface, data));
  } catch (error) {
    console.warn("Using the built-in activity snapshot.", error);
    surfaces.forEach((surface) => {
      surface.dataset.activityLoaded = "fallback";
      initCounters(surface);
    });
  }
}

initCounters();
loadActivityData();
