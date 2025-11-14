-- Enable búsqueda full-text usando FTS5 sobre columnas clave de Term.
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

-- Disparador para mantener la tabla FTS sincronizada en inserts.
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

-- Disparador para sincronizar cuando se actualiza un término.
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

-- Disparador para limpiar la tabla FTS cuando se elimina un término.
CREATE TRIGGER term_search_ad AFTER DELETE ON "Term" BEGIN
    INSERT INTO "TermSearch"("TermSearch", rowid) VALUES ('delete', old.id);
END;

-- Población inicial de la tabla virtual en base a los datos existentes.
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
