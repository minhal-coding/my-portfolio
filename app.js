const networkingMessage = `Hi, I hope you are doing well. My name is Syed Muhammad Minhal Abbas Rizvi. I am a Computer Science student based in Woodbridge, Virginia, with experience across AI systems, SaaS operations, workflow automation, product/project coordination, leadership, and international business operations. I have built and supported work across EasyTodo, YAM, Growmatic, BSL, BabyScientists, NOVA, and international leadership programs. I am currently looking for opportunities where I can help organizations use AI, cloud, automation, and operational systems to work smarter and scale better. Here is my portfolio link: [insert portfolio link]. I would be grateful if you could review it or connect me with any relevant opportunity.`;

const caseGrid = document.querySelector("#caseGrid");
const filters = document.querySelectorAll(".filter");
const copyButton = document.querySelector("#copyMessage");
const copyStatus = document.querySelector("#copyStatus");

function renderCases(filter = "all") {
  const workExperiences = experiences.filter((item) => item.category === "work");
  const visibleCases = filter === "all" ? workExperiences : workExperiences.filter((item) => item.tags.includes(filter));

  caseGrid.innerHTML = visibleCases
    .map(
      (item) => `
        <article class="case-card glow-card">
          <div class="case-visual">
            ${
              item.image
                ? `<img class="case-image" src="${item.image}" alt="${item.title} website image" loading="lazy" />`
                : `<span>${item.title.split(" ").slice(0, 2).map((word) => word[0]).join("")}</span>`
            }
          </div>
          <span class="meta">${item.meta}</span>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <div class="tags">
            ${item.tags.map((tag) => `<span>${tag}</span>`).join("")}
          </div>
          <div class="case-actions">
            <a class="case-link shiny-button" href="./experience.html?id=${item.slug}" aria-label="View detailed experience for ${item.title}">View impact</a>
            ${item.website ? `<a class="case-link secondary-link shiny-button" href="${item.website}" target="_blank" rel="noopener">Website</a>` : ""}
          </div>
        </article>
      `
    )
    .join("");

  initGlowCards();
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderCases(button.dataset.filter);
  });
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(networkingMessage);
    copyStatus.textContent = "Networking message copied.";
  } catch {
    copyStatus.textContent = "Copy failed. Select and copy this message from the source file.";
  }
});

function initGlowCards() {
  document
    .querySelectorAll(
      ".quick-stats div, .academic-grid article, .community-grid article, .conference-grid article, .capability-grid article, .timeline article, .proof-grid article"
    )
    .forEach((card) => card.classList.add("glow-card"));

  document.querySelectorAll(".glow-card").forEach((card) => {
    if (card.dataset.glowReady) return;
    card.dataset.glowReady = "true";
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

function scrambleText(element) {
  const original = element.textContent.trim();
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const steps = 22;
  let step = 0;

  const interval = window.setInterval(() => {
    const progress = step / steps;
    element.textContent = original
      .split("")
      .map((char, index) => {
        if (char === " ") return " ";
        return index / original.length < progress
          ? char
          : chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");

    step += 1;
    if (step > steps) {
      window.clearInterval(interval);
      element.textContent = original;
    }
  }, 35);
}

renderCases();
initGlowCards();
document.querySelectorAll("[data-scramble]").forEach(scrambleText);
