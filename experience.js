const detailRoot = document.querySelector("#experienceDetail");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const requestedIndex = experiences.findIndex((item) => item.slug === id);
const currentIndex = requestedIndex >= 0 ? requestedIndex : 0;
const item = experiences[currentIndex];
const relatedItems = experiences.filter((entry) => entry.category === item.category);
const relatedIndex = relatedItems.findIndex((entry) => entry.slug === item.slug);
const previous = relatedItems[(relatedIndex - 1 + relatedItems.length) % relatedItems.length];
const next = relatedItems[(relatedIndex + 1) % relatedItems.length];
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
const pageDescription = `${item.summary} Read Minhal Rizvi's role, impact, and skills.`;
const canonicalUrl = `https://minhal-coding.github.io/my-portfolio/experience.html?id=${encodeURIComponent(item.slug)}`;
document.querySelector('meta[name="description"]')?.setAttribute("content", pageDescription);
document.querySelector('meta[property="og:title"]')?.setAttribute("content", document.title);
document.querySelector('meta[property="og:description"]')?.setAttribute("content", pageDescription);
document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);

const detailNavigation = relatedItems.length > 1
  ? `<section class="section detail-nav" aria-label="More ${item.category} experiences">
      <a href="./experience.html?id=${previous.slug}">Previous: ${previous.title}</a>
      <a href="./experience.html?id=${next.slug}">Next: ${next.title}</a>
    </section>`
  : "";

detailRoot.innerHTML = `
  <section class="detail-hero${item.image ? "" : " detail-hero-no-media"}">
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
        ? `<img class="detail-hero-image" src="${item.image}" alt="${item.title} brand mark or project visual" />`
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
                .map((link) => `<a href="${link.url}" target="_blank" rel="noopener">${link.label}<span class="sr-only"> (opens in a new tab)</span></a>`)
                .join("")}
            </div>`
          : ""
      }
      <a class="primary detail-download" href="./assets/Syed-Minhal-Abbas-Rizvi-CV.pdf" download>Download CV</a>
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

  ${detailNavigation}
`;
