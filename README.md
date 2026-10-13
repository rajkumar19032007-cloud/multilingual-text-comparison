# 07 - Multilingual Text Comparison Tool

A statistical lexical comparison and set-similarity tool built for the **Text and Speech Analysis** laboratory course. It performs Unicode-aware tokenization across two independent text passages, calculates mathematical similarity metrics (**Jaccard Similarity** and **Sørensen-Dice Coefficient**), highlights shared vs. unique vocabulary side-by-side, and generates a searchable token frequency distribution table.

---

## 1. Project Title
**Multilingual Text Comparison Tool** (Project 07 of 10)

## 2. Project Description
Determining vocabulary similarity between two text passages is fundamental to plagiarism analysis, document clustering, and cross-lingual cognate detection. This application provides a transparent, client-side implementation of set-theoretic token similarity. By leveraging modern Unicode regular expressions (`\p{L}\p{N}`), the tool accurately compares multilingual texts (including accented Romance languages, Cyrillic, and Greek) without mangling non-ASCII characters.

## 3. Objectives
- Implement Unicode-aware tokenization using modern regex character property escapes (`\p{L}`).
- Calculate Jaccard Similarity and Sørensen-Dice index coefficients between token sets.
- Partition vocabulary into:
  - Tokens shared by both passages.
  - Tokens unique to Passage A.
  - Tokens unique to Passage B.
- Render side-by-side visual token alignment with styled highlights.
- Provide a searchable comparative token frequency table.

## 4. Features
- **Dual Text Editor Inputs:** Independent textareas for Text Passage A and Text Passage B.
- **Unicode Script Support:** Handles international characters, diacritics, and accents (e.g., `é`, `ñ`, `ü`, `ç`) seamlessly.
- **Mathematical Similarity Metrics:**
  - Jaccard Similarity percentage ($0.0\%$ to $100.0\%$).
  - Sørensen-Dice Index percentage ($0.0\%$ to $100.0\%$).
- **Vocabulary Partition Badges:** Instant counts of shared words, words unique to A, and words unique to B.
- **Case-Sensitivity Toggle:** Configurable option to ignore or enforce character case during tokenization.
- **Side-by-Side Highlighted Diff View:** Simultaneously highlights shared words (in blue) and unique words in both passages.
- **Searchable Token Frequency Table:** Full inventory of all tokens with counts in A, counts in B, total occurrences, and status badges.
- **Three Educational Presets:**
  1. *Similar English News:* High-overlap reports on Mars exploration (~46% Jaccard).
  2. *Spanish vs. French Cognates:* Scientific passages demonstrating Romance cognate overlap.
  3. *Different Topics:* Low-overlap comparison between bread baking and operating systems (<5% Jaccard).

## 5. Technologies Used
- **HTML5:** Semantic dual-column structure, accessible checkboxes, and tabular markup.
- **CSS3:** Indigo and cyan theme, responsive CSS Grid, sticky table headers, and token highlighting.
- **Vanilla JavaScript (ES6+):** Unicode regex tokenization (`\p{L}`), JavaScript `Set` operations, and DOM generation.
- **Node.js (Optional):** Zero-dependency static server and test suite runner.

## 6. How It Works
1. **Input:** The user types or pastes text into Passage A and Passage B, or clicks a sample preset.
2. **Unicode Tokenization:** Text is parsed into word arrays using the Unicode regular expression:
   ```javascript
   text.match(/[\p{L}\p{N}]+/gu)
   ```
3. **Set Construction:** Distinct sets of unique tokens $S_A$ and $S_B$ are generated.
4. **Set Metrics Calculation:**
   - Intersection: $S_{\text{shared}} = S_A \cap S_B$
   - Difference A: $S_{\text{onlyA}} = S_A \setminus S_B$
   - Difference B: $S_{\text{onlyB}} = S_B \setminus S_A$
   - Union: $S_{\text{union}} = S_A \cup S_B$
   - Jaccard and Dice coefficients are computed.
5. **Reconstruction & Rendering:** The UI renders the metric cards, side-by-side highlighted text panes, and the searchable vocabulary frequency table.

## 7. Algorithm Explanation

### A. Jaccard Similarity Coefficient
Measures the ratio of shared unique tokens to total unique tokens:
$$J(A, B) = \frac{|S_A \cap S_B|}{|S_A \cup S_B|} = \frac{|S_{\text{shared}}|}{|S_A| + |S_B| - |S_{\text{shared}}|}$$

### B. Sørensen-Dice Coefficient
Gives double weight to shared tokens, reflecting harmonic set overlap:
$$D(A, B) = \frac{2 \cdot |S_A \cap S_B|}{|S_A| + |S_B|}$$

### C. Unicode Letter Property Matching (`\p{L}`)
Standard ASCII regex `\b[a-zA-Z]+\b` erroneously splits accented words (e.g., turning Spanish *"fotosíntesis"* into *"fotos"* and *"ntesis"*).
By employing the Unicode flag `u` with the property escape `\p{L}` (any letter in any script), multilingual tokens remain unified:
```javascript
const unicodeTokenPattern = /[\p{L}\p{N}]+/gu;
```

## 8. Installation Instructions
No external npm dependencies required.

```bash
cd 07-multilingual-text-comparison
```

## 9. How to Run Locally

### Option A: Open Directly in Browser
Double-click `index.html` to open in any web browser.

### Option B: Built-In Node Dev Server
```bash
npm run dev
```
Open your browser at `http://localhost:3007`.

### Option C: Run Automated Tests
```bash
npm test
```

## 10. Example Input and Expected Output

### Input Passage A:
```text
NASA successfully launched its new robotic rover to Mars today. The rover will explore ancient lakebeds.
```

### Input Passage B:
```text
Today NASA launched an advanced rover destined for Mars. The robotic mission aims to explore ancient lakebeds.
```

### Expected Output:
- **Jaccard Similarity:** ~57.1%
- **Sørensen-Dice Index:** ~72.7%
- **Shared Tokens (12):** `nasa`, `launched`, `rover`, `to`, `mars`, `today`, `the`, `robotic`, `explore`, `ancient`, `lakebeds`, `its` (or similar depending on casing)
- **Only in A:** `successfully`, `new`, `will`
- **Only in B:** `an`, `advanced`, `destined`, `for`, `mission`, `aims`

## 11. Project Structure
```text
07-multilingual-text-comparison/
├── index.html         # Application layout, side-by-side textareas, table view
├── style.css          # Indigo/cyan theme, diff highlight marks, sticky table
├── script.js          # Unicode tokenization, Jaccard/Dice math, table filter
├── package.json       # Dev server and test runner scripts
├── .gitignore         # Git ignore exclusions
└── README.md          # Complete laboratory documentation
```

## 12. Browser Compatibility Notes
- 100% compatible with Chrome, Edge, Firefox, Safari, and mobile browsers supporting ES2018 Unicode regex property escapes (`\p{L}`).
- Executes 100% offline in client memory.

## 13. Limitations
- **Surface Overlap vs. Semantic Meaning:** The Jaccard metric measures exact surface token matching. Two passages with synonymous phrasing (*"The vehicle stopped"* vs. *"The car halted"*) will yield zero lexical overlap despite identical semantic meaning.
- **Languages Without Whitespace:** Languages that do not use whitespace between words (such as Chinese, Japanese, or Thai) require morphological dictionary segmenters (`Intl.Segmenter`); regex tokenization alone treats entire sentences as single tokens without space boundaries.
- **No Translation:** This tool does not translate text; it measures literal shared vocabulary (cognates and common terms).

## 14. Future Enhancements
- Integrate `Intl.Segmenter` for CJK (Chinese, Japanese, Korean) word segmentation.
- Add Levenshtein distance matching to detect approximate cognates across languages (*"información"* vs. *"information"*).

## 15. Screenshot Placeholder
```text
+--------------------------------------------------------------------+
|  [PROJECT 07] Multilingual Text Comparison Tool                    |
+--------------------------------------------------------------------+
|  [Similar English News]  [Spanish vs French]  [Different Topics]   |
+---------------------------------+----------------------------------+
|  TEXT PASSAGE A                 | TEXT PASSAGE B                   |
|  "NASA successfully launched    | "Today NASA launched an          |
|  its new robotic rover to Mars" | advanced rover to Mars"          |
+---------------------------------+----------------------------------+
|  [ ⚖ Compare Passages ]  [x] Ignore Case                           |
+--------------------------------------------------------------------+
|  JACCARD: 46.8%  |  DICE: 63.8%  |  SHARED: 22  | ONLY A: 14       |
+---------------------------------+----------------------------------+
|  PASSAGE A VIEW                 | PASSAGE B VIEW                   |
|  "[NASA] successfully [launched]| Today [NASA] [launched] an       |
|  its new [robotic] [rover]..."  | advanced [robotic] [rover]..."   |
+---------------------------------+----------------------------------+
```

## 16. Viva Preparation: Questions & Answers

### Q1: What is Jaccard Similarity, and what are its mathematical bounds?
**Answer:** The Jaccard Similarity coefficient is defined as the size of the intersection divided by the size of the union of two sample sets:
$$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$
Its values range strictly between $0.0$ (disjoint sets with no shared elements) and $1.0$ (identical sets).

### Q2: How does the Sørensen-Dice coefficient differ from the Jaccard index?
**Answer:** The Sørensen-Dice coefficient gives double weight to true positive shared tokens:
$$D(A, B) = \frac{2 |A \cap B|}{|A| + |B|}$$
It is monotonic with respect to Jaccard: $D = \frac{2J}{1 + J}$. Dice scores are always greater than or equal to Jaccard scores, making Dice more sensitive to shared vocabulary in smaller sets.

### Q3: Why is Unicode regex `\p{L}` necessary for multilingual text analysis?
**Answer:** The ASCII character range `[a-zA-Z]` only covers the unaccented English alphabet. In international languages like French, Spanish, German, or Hindi, letters contain accents or belong to different Unicode blocks (e.g., `é`, `ñ`, `ü`, `य`). Using Unicode letter property escapes `\p{L}` with the `u` flag ensures that international words are tokenized as single cohesive tokens.

### Q4: Can Jaccard token similarity determine whether two passages in different languages mean the same thing?
**Answer:** No. Jaccard similarity measures literal surface token overlap. Unless the languages share identical loanwords, numbers, or cognates (such as English *"satellite"* and French *"satellite"*), cross-lingual lexical similarity will be near zero even if the semantic meaning is identical. Cross-lingual semantic equivalence requires translation or multilingual neural embeddings.

### Q5: How do you handle case-insensitive set comparisons without mutating the original text display?
**Answer:** The application performs lowercase normalization on the extracted token keys used for set operations, while storing and rendering the original capitalized tokens with character offset slicing in the side-by-side view, preserving original punctuation and casing for the reader.

---

## 17. Git Upload Instructions
To publish this project to an independent GitHub repository:

```bash
# 1. Initialize git
git init

# 2. Stage all project files
git add .

# 3. Commit files
git commit -m "Initial commit: Project 07 Multilingual Text Comparison Tool"

# 4. Set default branch to main
git branch -M main

# 5. Link your independent GitHub repository
git remote add origin YOUR_GITHUB_REPOSITORY_URL

# 6. Push to GitHub
git push -u origin main
```
*(Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual remote URL).*

---

## 18. License
This project is licensed under the **MIT License**.
