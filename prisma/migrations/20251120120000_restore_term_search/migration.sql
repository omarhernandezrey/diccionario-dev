-- Restaura el índice FTS5 de términos junto con los triggers de sincronización.
DROP TRIGGER IF EXISTS term_search_ai;
DROP TRIGGER IF EXISTS term_search_au;
DROP TRIGGER IF EXISTS term_search_ad;
DROP TABLE IF EXISTS "TermSearch";

CREATE VIRTUAL TABLE "TermSearch" USING fts5 (
    term,
    translation,
    meaning,
    what,
    how,
    aliases,
    tags,
    examples,
    category,
    content='Term',
    content_rowid='id',
    tokenize='unicode61 remove_diacritics 2'
);

CREATE TRIGGER term_search_ai AFTER INSERT ON "Term" BEGIN
    INSERT INTO "TermSearch"(rowid, term, translation, meaning, what, how, aliases, tags, examples, category)
    VALUES (
        new.id,
        new.term,
        new.translation,
        new.meaning,
        new.what,
        new.how,
        COALESCE(CAST(new.aliases AS TEXT), ''),
        COALESCE(CAST(new.tags AS TEXT), ''),
        COALESCE(CAST(new.examples AS TEXT), ''),
        new.category
    );
END;

CREATE TRIGGER term_search_au AFTER UPDATE ON "Term" BEGIN
    INSERT INTO "TermSearch"("TermSearch", rowid) VALUES ('delete', old.id);
    INSERT INTO "TermSearch"(rowid, term, translation, meaning, what, how, aliases, tags, examples, category)
    VALUES (
        new.id,
        new.term,
        new.translation,
        new.meaning,
        new.what,
        new.how,
        COALESCE(CAST(new.aliases AS TEXT), ''),
        COALESCE(CAST(new.tags AS TEXT), ''),
        COALESCE(CAST(new.examples AS TEXT), ''),
        new.category
    );
END;

CREATE TRIGGER term_search_ad AFTER DELETE ON "Term" BEGIN
    INSERT INTO "TermSearch"("TermSearch", rowid) VALUES ('delete', old.id);
END;

INSERT INTO "TermSearch"(rowid, term, translation, meaning, what, how, aliases, tags, examples, category)
SELECT
    "id",
    "term",
    "translation",
    "meaning",
    "what",
    "how",
    COALESCE(CAST("aliases" AS TEXT), ''),
    COALESCE(CAST("tags" AS TEXT), ''),
    COALESCE(CAST("examples" AS TEXT), ''),
    "category"
FROM "Term";
