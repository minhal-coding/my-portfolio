const detailRoot = document.querySelector("#experienceDetail");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const currentIndex = experiences.findIndex((item) => item.slug === id);
const item = experiences[currentIndex] || experiences[0];
const previous = experiences[(currentIndex - 1 + experiences.length) % experiences.length] || experiences[experiences.length - 1];
const next = experiences[(currentIndex + 1) % experiences.length] || experiences[1];
const externalLinks = [
  item.website ? { label: "Official website", url: item.website } : null,
  ...(item.relatedLinks || [])
].filter(Boolean);
const backTargets = {
  work: { label: "Back to work experience", hash: "work" },
  academic: { label: "Back to academics", hash: "academics" },
  community: { label: "Back to community work", hash: "community" },
  leadership: { label: "Back to conferences", hash: "conferences" }
};
const backTarget = backTargets[item.category] || backTargets.work;

document.title = `${item.title} | Syed Muhammad Minhal Abbas Rizvi`;

detailRoot.innerHTML = `
  <section class="detail-hero">
    <div>
      <a class="back-link" href="./index.html#${backTarget.hash}">${backTarget.label}</a>
      <p class="eyebrow">${item.meta}</p>
      <h1>${item.title}</h1>
      <p class="hero-text">${item.summary}</p>
      <div class="detail-meta">
        <span>${item.location}</span>
        <span>${item.tags.join(" | ")}</span>
      </div>
    </div>
    ${
      item.image
        ? `<img class="detail-hero-image" src="${item.image}" alt="${item.title} website image" />`
        : ""
    }
  </section>

  <section class="section detail-layout">
    <aside class="detail-sidebar">
      <h2>Value Snapshot</h2>
      <ul>
        ${item.impact.map((point) => `<li>${point}</li>`).join("")}
      </ul>
      ${
        externalLinks.length
          ? `<div class="external-links">
              ${externalLinks
                .map((link) => `<a href="${link.url}" target="_blank" rel="noopener">${link.label}</a>`)
                .join("")}
            </div>`
          : ""
      }
      <a class="primary detail-download" href="./assets/Syed-Minhal-Abbas-Rizvi-Portfolio.pdf" download>Download source PDF</a>
    </aside>

    <div class="detail-content">
      <article class="detail-card">
        <p class="eyebrow">Overview</p>
        <p>${item.overview}</p>
      </article>

      ${item.sections
        .map(
          (section) => `
            <article class="detail-card">
              <h2>${section.title}</h2>
              <p>${section.body}</p>
            </article>
          `
        )
        .join("")}

      <article class="detail-card">
        <h2>Skills strengthened</h2>
        <div class="tags detail-tags">
          ${item.skills.map((skill) => `<span>${skill}</span>`).join("")}
        </div>
      </article>
    </div>
  </section>

  <section class="section detail-nav">
    <a href="./experience.html?id=${previous.slug}">Previous: ${previous.title}</a>
    <a href="./experience.html?id=${next.slug}">Next: ${next.title}</a>
  </section>
`;
