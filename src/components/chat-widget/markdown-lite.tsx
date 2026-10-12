/**
 * Renderizador de Markdown "lite" -- sem dependência externa.
 *
 * O agente responde em Markdown simples (negrito, listas, quebras de linha,
 * títulos curtos). Em vez de puxar react-markdown + remark (muitas deps), este
 * componente cobre esse subset com MUI. Não é um parser completo de CommonMark;
 * é o suficiente para as respostas do assistente ficarem legíveis.
 *
 * Suporta:
 *   **negrito**  -> <strong>
 *   - item / * item / 1. item  -> lista com marcador
 *   # / ## / ### título         -> Typography subtitle
 *   linhas em branco            -> espaçamento entre blocos
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

/** Quebra uma linha em spans aplicando apenas **negrito**. */
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      return <strong key={i}>{bold[1]}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

type Block =
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'paragraph'; lines: string[] };

/** Agrupa as linhas em blocos (título, lista, parágrafo). */
function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let list: string[] | null = null;
  let para: string[] | null = null;

  const flushPara = () => {
    if (para && para.length) blocks.push({ type: 'paragraph', lines: para });
    para = null;
  };
  const flushList = () => {
    if (list && list.length) blocks.push({ type: 'list', items: list });
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    const bullet = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);

    if (heading) {
      flushPara();
      flushList();
      blocks.push({ type: 'heading', text: heading[1] });
    } else if (bullet) {
      flushPara();
      if (!list) list = [];
      list.push(bullet[1]);
    } else if (line.trim() === '') {
      flushPara();
      flushList();
    } else {
      flushList();
      if (!para) para = [];
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}

export function MarkdownLite({ text }: { text: string }) {
  const blocks = parseBlocks(text);

  return (
    <Box sx={{ '& > *:not(:last-child)': { mb: 0.75 } }}>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <Typography key={i} variant="subtitle2" sx={{ fontWeight: 700 }}>
              {renderInline(block.text)}
            </Typography>
          );
        }
        if (block.type === 'list') {
          return (
            <Box key={i} component="ul" sx={{ m: 0, pl: 2.5 }}>
              {block.items.map((item, j) => (
                <Typography key={j} component="li" variant="body2">
                  {renderInline(item)}
                </Typography>
              ))}
            </Box>
          );
        }
        return (
          <Typography key={i} variant="body2">
            {block.lines.map((ln, j) => (
              <Box key={j} component="span" sx={{ display: 'block' }}>
                {renderInline(ln)}
              </Box>
            ))}
          </Typography>
        );
      })}
    </Box>
  );
}
