const RELEASES_API =
  "https://api.github.com/repos/BeNQ15/Bluewser/releases?per_page=5";

const releasesBox = document.getElementById("releases");

function formatDate(value) {
  if (!value) return "Дата не указана";

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium"
  }).format(new Date(value));
}

function createReleaseCard(release) {
  const card = document.createElement("article");
  card.className = "card release";

  const info = document.createElement("div");

  const title = document.createElement("h3");
  title.textContent = release.name || release.tag_name || "Релиз Bluewser";

  const date = document.createElement("div");
  date.className = "meta";
  date.textContent = formatDate(release.published_at);

  info.append(title, date);

  const links = document.createElement("div");
  links.className = "actions";
  links.style.marginTop = "0";

  const apkFiles = (release.assets || []).filter(asset =>
    asset.name.toLowerCase().endsWith(".apk")
  );

  if (apkFiles.length > 0) {
    for (const apk of apkFiles) {
      const link = document.createElement("a");
      link.className = "button";
      link.href = apk.browser_download_url;
      link.textContent = `Скачать ${apk.name}`;
      link.setAttribute("aria-label", `Скачать ${apk.name}`);
      links.append(link);
    }
  } else {
    const link = document.createElement("a");
    link.className = "button secondary";
    link.href = release.html_url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Открыть релиз ↗";
    links.append(link);
  }

  card.append(info, links);
  return card;
}

async function loadReleases() {
  try {
    const response = await fetch(RELEASES_API, {
      headers: {
        Accept: "application/vnd.github+json"
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API вернул статус ${response.status}`);
    }

    const releases = await response.json();
    releasesBox.replaceChildren();

    if (releases.length === 0) {
      const message = document.createElement("div");
      message.className = "empty";
      message.textContent =
        "Релизов пока нет. APK появятся здесь после публикации релиза с GitHub.";
      releasesBox.append(message);
      return;
    }

    for (const release of releases.slice(0, 5)) {
      releasesBox.append(createReleaseCard(release));
    }
  } catch (error) {
    const message = document.createElement("div");
    message.className = "notice";

    const text = document.createTextNode(
      "Не удалось загрузить релизы автоматически. "
    );

    const link = document.createElement("a");
    link.href = "https://github.com/BeNQ15/Bluewser/releases";
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Откройте релизы на GitHub ↗";

    message.append(text, link);
    releasesBox.replaceChildren(message);

    console.error("Ошибка загрузки релизов:", error);
  }
}

loadReleases();
