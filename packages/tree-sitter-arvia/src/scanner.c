/**
 * External scanner mirroring the compiler lexer's parser-driven modes
 * (packages/compiler/src/lexer/lexer.ts):
 *
 * - RAW_VALUE: everything up to an unnested `;` or `}`, balancing
 *   parentheses and skipping strings; stops before a ` doc "` suffix.
 * - RAW_SELECTOR: everything up to `{`.
 *
 * Leading whitespace and leading comments are NOT consumed — returning
 * false lets the grammar's extras eat them, after which the scanner is
 * consulted again.
 */
#include "tree_sitter/parser.h"
#include <stdbool.h>
#include <wctype.h>

enum TokenType {
  RAW_VALUE,
  RAW_SELECTOR,
};

void *tree_sitter_arvia_external_scanner_create(void) { return NULL; }
void tree_sitter_arvia_external_scanner_destroy(void *payload) { (void)payload; }
unsigned tree_sitter_arvia_external_scanner_serialize(void *payload, char *buffer) {
  (void)payload;
  (void)buffer;
  return 0;
}
void tree_sitter_arvia_external_scanner_deserialize(void *payload, const char *buffer,
                                                    unsigned length) {
  (void)payload;
  (void)buffer;
  (void)length;
}

static void skip_ws(TSLexer *lexer) {
  while (lexer->lookahead == ' ' || lexer->lookahead == '\t' || lexer->lookahead == '\r' ||
         lexer->lookahead == '\n') {
    lexer->advance(lexer, true);
  }
}

static bool at_comment_start(TSLexer *lexer) { return lexer->lookahead == '/'; }

/** `doc` followed by whitespace and a quote — the token-entry doc suffix.
 *  Caller is positioned at whitespace; we only peek via advance+mark_end
 *  discipline, so this must be called with mark_end already set. */
static bool scan_doc_suffix_ahead(TSLexer *lexer) {
  // consume the whitespace run
  bool saw_ws = false;
  while (lexer->lookahead == ' ' || lexer->lookahead == '\t' || lexer->lookahead == '\r' ||
         lexer->lookahead == '\n') {
    saw_ws = true;
    lexer->advance(lexer, false);
  }
  if (!saw_ws) return false;
  const char *word = "doc";
  for (const char *c = word; *c; c++) {
    if (lexer->lookahead != (int32_t)*c) return false;
    lexer->advance(lexer, false);
  }
  bool ws_after = false;
  while (lexer->lookahead == ' ' || lexer->lookahead == '\t') {
    ws_after = true;
    lexer->advance(lexer, false);
  }
  if (!ws_after) return false;
  return lexer->lookahead == '"' || lexer->lookahead == '\'';
}

static bool scan_raw_value(TSLexer *lexer) {
  skip_ws(lexer);
  if (lexer->eof(lexer)) return false;
  if (lexer->lookahead == ';' || lexer->lookahead == '}') return false;
  // Leading comments belong to extras (matching Lexer.skipTrivia).
  if (at_comment_start(lexer)) return false;

  int depth = 0;
  int32_t quote = 0;
  bool any = false;
  lexer->mark_end(lexer);

  while (!lexer->eof(lexer)) {
    int32_t c = lexer->lookahead;
    if (quote) {
      if (c == '\\') {
        lexer->advance(lexer, false);
        if (!lexer->eof(lexer)) lexer->advance(lexer, false);
        lexer->mark_end(lexer);
        any = true;
        continue;
      }
      if (c == quote) quote = 0;
      lexer->advance(lexer, false);
      lexer->mark_end(lexer);
      any = true;
      continue;
    }
    if (c == '"' || c == '\'') {
      quote = c;
      lexer->advance(lexer, false);
      lexer->mark_end(lexer);
      any = true;
      continue;
    }
    if (c == '(') depth++;
    if (c == ')' && depth > 0) depth--;
    if (depth == 0 && (c == ';' || c == '}')) break;
    if (c == ' ' || c == '\t' || c == '\r' || c == '\n') {
      if (depth == 0) {
        // Trailing whitespace stays out of the token; also probe for ` doc "`.
        // The probe advances past the run (and possibly a partial `doc`)
        // without marking — continue from wherever it stopped.
        if (scan_doc_suffix_ahead(lexer)) break;
        continue;
      }
      // Whitespace inside parens is interior — consume it unmarked; the
      // next significant character extends the token over it.
      lexer->advance(lexer, false);
      continue;
    }
    lexer->advance(lexer, false);
    lexer->mark_end(lexer);
    any = true;
  }

  if (!any || quote) return false;
  lexer->result_symbol = RAW_VALUE;
  return true;
}

static bool scan_raw_selector(TSLexer *lexer) {
  skip_ws(lexer);
  if (lexer->eof(lexer)) return false;
  if (lexer->lookahead == '{' || lexer->lookahead == '}' || lexer->lookahead == ';') return false;
  // CSS selectors never start with '@'; bailing here lets the `at_rule` rule
  // claim raw at-rules instead of swallowing them as a selector.
  if (lexer->lookahead == '@') return false;
  if (at_comment_start(lexer)) return false;

  bool any = false;
  lexer->mark_end(lexer);
  while (!lexer->eof(lexer)) {
    int32_t c = lexer->lookahead;
    if (c == '{') break;
    if (c == '}' || c == ';') return false;
    if (c == ' ' || c == '\t' || c == '\r' || c == '\n') {
      lexer->advance(lexer, false);
      continue;
    }
    lexer->advance(lexer, false);
    lexer->mark_end(lexer);
    any = true;
  }
  if (!any || lexer->eof(lexer)) return false;
  lexer->result_symbol = RAW_SELECTOR;
  return true;
}

/**
 * At-rule prelude (both RAW_VALUE and RAW_SELECTOR are valid): scan to the
 * first unnested terminator and dispatch by it — `{` → block (RAW_SELECTOR),
 * `;` / `}` → statement (RAW_VALUE). This resolves the `@name … {` vs
 * `@name … ;` ambiguity, which neither single scanner can decide alone.
 */
static bool scan_prelude(TSLexer *lexer) {
  skip_ws(lexer);
  if (lexer->eof(lexer)) return false;
  if (lexer->lookahead == '{' || lexer->lookahead == ';' || lexer->lookahead == '}') return false;
  if (lexer->lookahead == '@') return false;
  if (at_comment_start(lexer)) return false;

  int depth = 0;
  int32_t quote = 0;
  bool any = false;
  lexer->mark_end(lexer);

  while (!lexer->eof(lexer)) {
    int32_t c = lexer->lookahead;
    if (quote) {
      if (c == '\\') {
        lexer->advance(lexer, false);
        if (!lexer->eof(lexer)) lexer->advance(lexer, false);
        lexer->mark_end(lexer);
        any = true;
        continue;
      }
      if (c == quote) quote = 0;
      lexer->advance(lexer, false);
      lexer->mark_end(lexer);
      any = true;
      continue;
    }
    if (c == '"' || c == '\'') {
      quote = c;
      lexer->advance(lexer, false);
      lexer->mark_end(lexer);
      any = true;
      continue;
    }
    if (c == '(') depth++;
    if (c == ')' && depth > 0) depth--;
    if (depth == 0 && c == '{') {
      lexer->result_symbol = RAW_SELECTOR;
      return any;
    }
    if (depth == 0 && (c == ';' || c == '}')) {
      lexer->result_symbol = RAW_VALUE;
      return any;
    }
    if (c == ' ' || c == '\t' || c == '\r' || c == '\n') {
      lexer->advance(lexer, false); // trailing/interior whitespace stays unmarked
      continue;
    }
    lexer->advance(lexer, false);
    lexer->mark_end(lexer);
    any = true;
  }
  return false; // hit EOF without a terminator
}

bool tree_sitter_arvia_external_scanner_scan(void *payload, TSLexer *lexer,
                                             const bool *valid_symbols) {
  (void)payload;
  if (valid_symbols[RAW_VALUE] && valid_symbols[RAW_SELECTOR]) return scan_prelude(lexer);
  if (valid_symbols[RAW_VALUE]) return scan_raw_value(lexer);
  if (valid_symbols[RAW_SELECTOR]) return scan_raw_selector(lexer);
  return false;
}
