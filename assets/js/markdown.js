const MarkdownRenderer = (() => {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stripMarkdown(value) {
    return String(value)
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
      .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
      .replace(/[#>*_`|~\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function createSlugger() {
    const seen = new Map();

    return (text) => {
      const base = stripMarkdown(text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section';

      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      return count ? `${base}-${count + 1}` : base;
    };
  }

  function normalizeDocPath(path) {
    let normalized = path.trim().replace(/^['"]|['"]$/g, '').replace(/^\.?\//, '');
    if (!normalized.startsWith('docs/') && normalized.endsWith('.md')) {
      normalized = `docs/${normalized}`;
    }
    return normalized;
  }

  function renderInline(raw, context) {
    const codeTokens = [];
    let value = String(raw).replace(/`([^`]+)`/g, (_, code) => {
      const token = `@@CODE${codeTokens.length}@@`;
      codeTokens.push(`<code>${escapeHtml(code)}</code>`);
      return token;
    });

    value = escapeHtml(value);
    value = value.replace(/\[([^\]]+)]\(([^)]+)\)/g, (_, label, url) => {
      const cleaned = url.trim().replace(/^['"]|['"]$/g, '');
      if (/^(https?:|mailto:)/i.test(cleaned)) {
        return `<a href="${escapeHtml(cleaned)}" target="_blank" rel="noreferrer">${label}</a>`;
      }

      if (cleaned.startsWith('#')) {
        return `<a href="#/lire/${context.docId}/${escapeHtml(cleaned.slice(1))}">${label}</a>`;
      }

      const target = context.pathToDoc.get(normalizeDocPath(cleaned));
      return target
        ? `<a href="#/lire/${target.id}">${label}</a>`
        : `<span>${label}</span>`;
    });

    value = value
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');

    codeTokens.forEach((html, index) => {
      value = value.replace(`@@CODE${index}@@`, html);
    });

    return value;
  }

  function isTableStart(lines, index) {
    if (!lines[index] || !lines[index + 1]) return false;
    if (!lines[index].includes('|')) return false;
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1]);
  }

  function parseTableRow(line) {
    return line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim());
  }

  function renderTable(lines, context) {
    const header = parseTableRow(lines[0]);
    const body = lines.slice(2).map(parseTableRow);
    const headHtml = header.map((cell) => `<th>${renderInline(cell, context)}</th>`).join('');
    const bodyHtml = body.map((row) => {
      const cells = row.map((cell, index) => {
        const clean = stripMarkdown(cell);
        const evidence = /^[A-D](?:-[A-D])?$/.test(clean) ? ` data-evidence="${clean}"` : '';
        const label = header[index] ? ` data-label="${escapeHtml(stripMarkdown(header[index]))}"` : '';
        return `<td${label}${evidence}>${renderInline(cell, context)}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    return `<div class="table-wrap"><table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
  }

  function isBlockStart(lines, index) {
    const line = lines[index] || '';
    return (
      /^#{1,6}\s+/.test(line) ||
      /^```/.test(line) ||
      /^(\s*-{3,}\s*|⸻\s*)$/.test(line) ||
      /^>\s?/.test(line) ||
      /^\s*[-*]\s+/.test(line) ||
      /^\s*\d+\.\s+/.test(line) ||
      isTableStart(lines, index)
    );
  }

  function extractHeadings(markdown) {
    const slug = createSlugger();
    return markdown
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => {
        const match = line.match(/^(#{2,4})\s+(.+?)\s*#*$/);
        if (!match) return null;

        return {
          level: match[1].length,
          text: stripMarkdown(match[2]),
          id: slug(match[2])
        };
      })
      .filter(Boolean);
  }

  function render(markdown, context) {
    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    const html = [];
    const slug = createSlugger();
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];

      if (!line.trim()) {
        index += 1;
        continue;
      }

      const fence = line.match(/^```\s*([A-Za-z0-9_-]+)?\s*$/);
      if (fence) {
        const language = (fence[1] || '').toLowerCase();
        const code = [];
        index += 1;
        while (index < lines.length && !/^```/.test(lines[index])) {
          code.push(lines[index]);
          index += 1;
        }
        index += 1;
        html.push(language === 'mermaid'
          ? `<pre class="mermaid">${escapeHtml(code.join('\n'))}</pre>`
          : `<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
        continue;
      }

      const heading = line.match(/^(#{1,4})\s+(.+?)\s*#*$/);
      if (heading) {
        const level = heading[1].length;
        const text = heading[2];
        const id = slug(text);
        html.push(`<h${level} id="${id}">${renderInline(text, context)}</h${level}>`);
        index += 1;
        continue;
      }

      if (/^(\s*-{3,}\s*|⸻\s*)$/.test(line)) {
        html.push('<hr>');
        index += 1;
        continue;
      }

      if (isTableStart(lines, index)) {
        const tableLines = [];
        while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
          tableLines.push(lines[index]);
          index += 1;
        }
        html.push(renderTable(tableLines, context));
        continue;
      }

      if (/^>\s?/.test(line)) {
        const blockquote = [];
        while (index < lines.length && /^>\s?/.test(lines[index])) {
          blockquote.push(lines[index].replace(/^>\s?/, ''));
          index += 1;
        }
        html.push(`<blockquote>${render(blockquote.join('\n'), context)}</blockquote>`);
        continue;
      }

      if (/^\s*[-*]\s+/.test(line)) {
        const items = [];
        while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
          items.push(lines[index].replace(/^\s*[-*]\s+/, ''));
          index += 1;
        }
        html.push(`<ul>${items.map((item) => `<li>${renderInline(item, context)}</li>`).join('')}</ul>`);
        continue;
      }

      if (/^\s*\d+\.\s+/.test(line)) {
        const items = [];
        while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
          items.push(lines[index].replace(/^\s*\d+\.\s+/, ''));
          index += 1;
        }
        html.push(`<ol>${items.map((item) => `<li>${renderInline(item, context)}</li>`).join('')}</ol>`);
        continue;
      }

      const paragraph = [];
      while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
        paragraph.push(lines[index].trim());
        index += 1;
      }
      html.push(`<p>${renderInline(paragraph.join(' '), context)}</p>`);
    }

    return html.join('\n');
  }

  return {
    escapeHtml,
    stripMarkdown,
    extractHeadings,
    normalizeDocPath,
    render
  };
})();
