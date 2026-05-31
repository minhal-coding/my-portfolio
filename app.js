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
        <article class="case-card">
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
            <a class="case-link" href="./experience.html?id=${item.slug}" aria-label="View detailed experience for ${item.title}">View impact</a>
            ${item.website ? `<a class="case-link secondary-link" href="${item.website}" target="_blank" rel="noopener">Website</a>` : ""}
          </div>
        </article>
      `
    )
    .join("");
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

renderCases();
