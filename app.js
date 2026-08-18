const networkingMessage = `Hi, I hope you are doing well. My name is Syed Muhammad Minhal Abbas Rizvi. I am a Computer Science student and AI systems builder based in Woodbridge, Virginia, with experience in SaaS implementation, workflow automation, product operations, and technical project coordination across industries. I am currently applying that broader background to Growth AI Agent, an evidence-first construction opportunity intelligence project. You can view my work at https://minhal-coding.github.io/my-portfolio/. I would appreciate your feedback or an introduction to a relevant internship or early-career opportunity.`;

const caseGrid = document.querySelector("#caseGrid");
const filters = document.querySelectorAll(".filter");
const copyButton = document.querySelector("#copyMessage");
const copyStatus = document.querySelector("#copyStatus");
const caseCount = document.querySelector("#caseCount");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function renderCases(filter = "all") {
  if (!caseGrid) return;

  const workExperiences = experiences.filter((item) => item.category === "work");
  const visibleCases = filter === "all" ? workExperiences : workExperiences.filter((item) => item.tags.includes(filter));

  caseGrid.innerHTML = visibleCases
    .map(
      (item) => `
        <article class="case-card glow-card">
          <div class="case-visual">
            ${
              item.image
                ? `<img class="case-image" src="${item.image}" alt="${item.title} brand mark" loading="lazy" />`
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
            ${item.website ? `<a class="case-link secondary-link shiny-button" href="${item.website}" target="_blank" rel="noopener" aria-label="Open the ${item.title} website in a new tab">${item.title} website</a>` : ""}
          </div>
        </article>
      `
    )
    .join("");

  if (caseCount) {
    caseCount.textContent = `${visibleCases.length} work ${visibleCases.length === 1 ? "example" : "examples"} shown.`;
  }

  initGlowCards();
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    renderCases(button.dataset.filter);
  });
});

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy command was unavailable.");
}

copyButton?.addEventListener("click", async () => {
  try {
    await copyText(networkingMessage);
    copyStatus.textContent = "Networking message copied.";
  } catch {
    copyStatus.textContent = "Copy is unavailable in this browser. Email me and I will send the message directly.";
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
    if (reducedMotion) return;
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

renderCases();
initGlowCards();
