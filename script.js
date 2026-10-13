/**
 * Multilingual Text Comparison Tool
 * Project 07 - Text & Speech Analysis
 *
 * Implements Unicode-aware tokenization, set-theoretic similarity metrics
 * (Jaccard and Sørensen-Dice), frequency distribution, and side-by-side token diffs.
 */

// Sample text pairs
const SAMPLES = {
  similar: {
    a: `NASA successfully launched its new robotic rover to Mars today. The rover will explore ancient lakebeds and collect geological samples to search for signs of past microbial life. Scientists anticipate the mission will provide unprecedented insights into planetary evolution.`,
    b: `Today NASA launched an advanced rover destined for Mars. The robotic mission aims to collect rock samples from ancient lakebeds while searching for evidence of microbial life. Planetary scientists expect the mission will yield groundbreaking insights into Mars.`
  },
  multilingual: {
    a: `La fotosíntesis es un proceso biológico fundamental mediante el cual las plantas convierten la energía solar en energía química. Este sistema produce oxígeno vital para la atmósfera terrestre.`,
    b: `La photosynthèse est un processus biologique fondamental par lequel les plantes convertissent l'énergie solaire en énergie chimique. Ce système produit de l'oxygène vital pour l'atmosphère terrestre.`
  },
  different: {
    a: `Baking artisan sourdough bread requires high-protein flour, active wild yeast starter, water, and sea salt. Proper fermentation temperature and gluten development ensure a crisp golden crust.`,
    b: `Modern microkernel operating systems isolate memory management, device drivers, and inter-process communication into separate protected user-space address domains to ensure fault tolerance.`
  }
};

// DOM and Browser Integration
if (typeof document !== "undefined") {
  const textAInput = document.getElementById("textAInput");
  const textBInput = document.getElementById("textBInput");
  const metaTextA = document.getElementById("metaTextA");
  const metaTextB = document.getElementById("metaTextB");
  const compareBtn = document.getElementById("compareBtn");
  const clearBtn = document.getElementById("clearBtn");
  const ignoreCaseCheck = document.getElementById("ignoreCaseCheck");
  const statusAlert = document.getElementById("statusAlert");
  const sampleSimilarBtn = document.getElementById("sampleSimilarBtn");
  const sampleMultiBtn = document.getElementById("sampleMultiBtn");
  const sampleDiffBtn = document.getElementById("sampleDiffBtn");
  const emptyState = document.getElementById("emptyState");
  const resultsSection = document.getElementById("resultsSection");

  // Metrics Elements
  const metricJaccard = document.getElementById("metricJaccard");
  const metricDice = document.getElementById("metricDice");
  const metricSharedWords = document.getElementById("metricSharedWords");
  const metricOnlyA = document.getElementById("metricOnlyA");
  const metricOnlyB = document.getElementById("metricOnlyB");
  const diffViewA = document.getElementById("diffViewA");
  const diffViewB = document.getElementById("diffViewB");
  const tokenTableBody = document.getElementById("tokenTableBody");
  const tableFilterInput = document.getElementById("tableFilterInput");

  let currentComparison = null;

  // Event Listeners
  if (textAInput) textAInput.addEventListener("input", updateInputMetas);
  if (textBInput) textBInput.addEventListener("input", updateInputMetas);
  if (compareBtn) compareBtn.addEventListener("click", handleCompare);
  if (clearBtn) clearBtn.addEventListener("click", handleClear);
  if (ignoreCaseCheck) ignoreCaseCheck.addEventListener("change", handleCompareIfActive);
  if (sampleSimilarBtn) sampleSimilarBtn.addEventListener("click", () => loadSample("similar"));
  if (sampleMultiBtn) sampleMultiBtn.addEventListener("click", () => loadSample("multilingual"));
  if (sampleDiffBtn) sampleDiffBtn.addEventListener("click", () => loadSample("different"));
  if (tableFilterInput) tableFilterInput.addEventListener("input", filterTable);

  function updateInputMetas() {
    const a = textAInput.value.trim();
    const b = textBInput.value.trim();
    const wordsA = a ? tokenize(a, false).length : 0;
    const wordsB = b ? tokenize(b, false).length : 0;
    const sentA = a ? (a.match(/[.!?]+/g) || []).length || 1 : 0;
    const sentB = b ? (b.match(/[.!?]+/g) || []).length || 1 : 0;
    metaTextA.textContent = `${wordsA} words | ${sentA} sentences`;
    metaTextB.textContent = `${wordsB} words | ${sentB} sentences`;
  }

  function showAlert(msg, type = "error") {
    statusAlert.textContent = msg;
    statusAlert.className = `status-alert ${type}`;
    statusAlert.classList.remove("hidden");
  }

  function clearAlert() {
    statusAlert.textContent = "";
    statusAlert.className = "status-alert hidden";
  }

  function loadSample(key) {
    textAInput.value = SAMPLES[key].a;
    textBInput.value = SAMPLES[key].b;
    updateInputMetas();
    clearAlert();
    handleCompare();
  }

  function handleClear() {
    textAInput.value = "";
    textBInput.value = "";
    updateInputMetas();
    clearAlert();
    currentComparison = null;
    emptyState.classList.remove("hidden");
    resultsSection.classList.add("hidden");
  }

  function handleCompareIfActive() {
    if (!resultsSection.classList.contains("hidden")) {
      handleCompare();
    }
  }

  function handleCompare() {
    clearAlert();
    const textA = textAInput.value.trim();
    const textB = textBInput.value.trim();

    if (!textA || !textB) {
      showAlert("Please provide text in both Passage A and Passage B to compare.", "error");
      emptyState.classList.remove("hidden");
      resultsSection.classList.add("hidden");
      return;
    }

    const ignoreCase = ignoreCaseCheck.checked;
    const comparison = comparePassages(textA, textB, ignoreCase);
    currentComparison = comparison;

    // Render Metrics
    metricJaccard.textContent = `${comparison.jaccardPercent}%`;
    metricDice.textContent = `${comparison.dicePercent}%`;
    metricSharedWords.textContent = comparison.sharedTokens.size;
    metricOnlyA.textContent = comparison.onlyATokens.size;
    metricOnlyB.textContent = comparison.onlyBTokens.size;

    // Render Side-by-Side Highlighted Diff
    diffViewA.innerHTML = renderHighlightedTokens(textA, comparison.sharedTokens, ignoreCase);
    diffViewB.innerHTML = renderHighlightedTokens(textB, comparison.sharedTokens, ignoreCase);

    // Render Frequency Table
    renderTable(comparison.frequencyList);

    emptyState.classList.add("hidden");
    resultsSection.classList.remove("hidden");
  }

  function renderTable(list) {
    tokenTableBody.innerHTML = list.map(item => {
      let badgeClass = "status-both";
      let statusLabel = "Shared (Both)";
      if (item.countB === 0) {
        badgeClass = "status-a";
        statusLabel = "Only in A";
      } else if (item.countA === 0) {
        badgeClass = "status-b";
        statusLabel = "Only in B";
      }

      return `
        <tr>
          <td><strong>${escapeHtml(item.token)}</strong></td>
          <td><span class="badge-status ${badgeClass}">${statusLabel}</span></td>
          <td>${item.countA}</td>
          <td>${item.countB}</td>
          <td><strong>${item.countA + item.countB}</strong></td>
        </tr>
      `;
    }).join("");
  }

  function filterTable() {
    if (!currentComparison) return;
    const query = tableFilterInput.value.trim().toLowerCase();
    const filtered = currentComparison.frequencyList.filter(item => 
      item.token.toLowerCase().includes(query)
    );
    renderTable(filtered);
  }
}

/**
 * Text Comparison & Unicode Tokenization (Pure Logic & Testing)
 */

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Unicode-aware Tokenizer
 * Uses \p{L}\p{N} to match all letters and numbers across alphabets (Latin, accented, Cyrillic, Greek, Indic)
 */
function tokenize(text, ignoreCase = true) {
  if (!text) return [];
  const clean = ignoreCase ? text.toLowerCase() : text;
  return clean.match(/[\p{L}\p{N}]+/gu) || [];
}

/**
 * Compute Jaccard, Dice, and Frequency Lists
 */
function comparePassages(textA, textB, ignoreCase = true) {
  const tokensA = tokenize(textA, ignoreCase);
  const tokensB = tokenize(textB, ignoreCase);

  const freqA = {};
  const freqB = {};

  for (const t of tokensA) freqA[t] = (freqA[t] || 0) + 1;
  for (const t of tokensB) freqB[t] = (freqB[t] || 0) + 1;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  const sharedTokens = new Set();
  const onlyATokens = new Set();
  const onlyBTokens = new Set();
  const unionSet = new Set([...setA, ...setB]);

  for (const t of setA) {
    if (setB.has(t)) {
      sharedTokens.add(t);
    } else {
      onlyATokens.add(t);
    }
  }

  for (const t of setB) {
    if (!setA.has(t)) {
      onlyBTokens.add(t);
    }
  }

  // Jaccard Similarity = |A ∩ B| / |A ∪ B|
  const jaccard = unionSet.size > 0 ? sharedTokens.size / unionSet.size : 0;
  const jaccardPercent = (jaccard * 100).toFixed(1);

  // Sørensen-Dice Coefficient = 2 * |A ∩ B| / (|A| + |B|)
  const diceDenominator = setA.size + setB.size;
  const dice = diceDenominator > 0 ? (2 * sharedTokens.size) / diceDenominator : 0;
  const dicePercent = (dice * 100).toFixed(1);

  // Frequency Table Array
  const frequencyList = Array.from(unionSet).map(token => ({
    token,
    countA: freqA[token] || 0,
    countB: freqB[token] || 0,
    total: (freqA[token] || 0) + (freqB[token] || 0),
    isShared: sharedTokens.has(token)
  }));

  // Sort: Shared tokens first, then by total frequency descending
  frequencyList.sort((a, b) => {
    if (a.isShared !== b.isShared) return a.isShared ? -1 : 1;
    return b.total - a.total;
  });

  return {
    tokensA,
    tokensB,
    setA,
    setB,
    sharedTokens,
    onlyATokens,
    onlyBTokens,
    unionSet,
    jaccard,
    jaccardPercent,
    dice,
    dicePercent,
    frequencyList
  };
}

/**
 * Render Highlighted Tokens in Text View
 */
function renderHighlightedTokens(rawText, sharedSet, ignoreCase = true) {
  // Tokenize with boundary preservation
  const segments = rawText.split(/([^\p{L}\p{N}]+)/gu);
  return segments.map(seg => {
    const key = ignoreCase ? seg.toLowerCase() : seg;
    if (sharedSet.has(key)) {
      return `<mark class="tok-shared">${escapeHtml(seg)}</mark>`;
    } else if (/^[\p{L}\p{N}]+$/u.test(seg)) {
      return `<span class="tok-unique">${escapeHtml(seg)}</span>`;
    }
    return escapeHtml(seg);
  }).join("");
}

// Module export for unit test verification
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SAMPLES,
    tokenize,
    comparePassages,
    renderHighlightedTokens
  };
}
